import { FastifyInstance } from "fastify";
import {
  ContentClient,
  FarcasterClient,
  NookClient,
} from "@nook/common/clients";
import { FARCASTER_OG_FIDS } from "@nook/common/farcaster";
import {
  BaseFarcasterCastWithContext,
  FarcasterCastResponse,
  GetEntityResponse,
  UrlContentResponse,
} from "@nook/common/types";
import { Channel } from "@nook/common/prisma/nook";

export const MAX_FEED_ITEMS = 25;

export class FarcasterService {
  private nookClient: NookClient;
  private contentClient: ContentClient;
  private farcasterClient: FarcasterClient;

  constructor(fastify: FastifyInstance) {
    this.nookClient = fastify.nook.client;
    this.contentClient = fastify.content.client;
    this.farcasterClient = new FarcasterClient();
  }

  async getCast(
    hash: string,
    viewerFid?: string,
  ): Promise<FarcasterCastResponse> {
    const cast = await this.farcasterClient.fetchCast(hash, viewerFid);
    const casts = await this.getCasts([cast], viewerFid);
    return casts[0];
  }

  async getCasts(
    casts: BaseFarcasterCastWithContext[],
    viewerFid?: string,
  ): Promise<FarcasterCastResponse[]> {
    const castMap = await this.getCastMap(casts, viewerFid);
    const [userMap, contentMap, channelMap] = await Promise.all([
      this.getUserMap(Object.values(castMap), viewerFid),
      this.getContentMap(Object.values(castMap)),
      this.getChannelMap(Object.values(castMap)),
    ]);

    return casts
      .map(({ hash }) =>
        this.formatCast(hash, castMap, userMap, contentMap, channelMap),
      )
      .filter(Boolean) as FarcasterCastResponse[];
  }

  async getCastMap(casts: BaseFarcasterCastWithContext[], viewerFid?: string) {
    const castMap = casts.reduce(
      (acc, cast) => {
        acc[cast.hash] = cast;
        return acc;
      },
      {} as Record<string, BaseFarcasterCastWithContext>,
    );
    const relatedCastHashes = new Set<string>();
    for (const cast of casts) {
      if (cast.parentHash) {
        relatedCastHashes.add(cast.parentHash);
      }
      if (cast.rootParentHash && cast.rootParentHash !== cast.hash) {
        relatedCastHashes.add(cast.rootParentHash);
      }
      for (const hash of cast.embedHashes) {
        relatedCastHashes.add(hash);
      }
    }
    const relatedCasts = await this.farcasterClient.fetchCasts(
      Array.from(relatedCastHashes),
      viewerFid,
    );
    for (const cast of relatedCasts.data) {
      castMap[cast.hash] = cast;
    }
    return castMap;
  }

  async getUserMap(casts: BaseFarcasterCastWithContext[], viewerFid?: string) {
    const fids = new Set<string>();
    for (const cast of casts) {
      fids.add(cast.fid);
      for (const { fid } of cast.mentions) {
        fids.add(fid);
      }
    }
    const [relatedUsers, entityIds] = await Promise.all([
      this.farcasterClient.fetchUsers(Array.from(fids), viewerFid),
      this.nookClient.getEntityIdsForFids(Array.from(fids)),
    ]);
    return relatedUsers.data.reduce(
      (acc, user, i) => {
        acc[user.fid] = { id: entityIds[i], farcaster: user };
        return acc;
      },
      {} as Record<string, GetEntityResponse>,
    );
  }

  async getContentMap(casts: BaseFarcasterCastWithContext[]) {
    const embedUrls = new Set<string>();
    for (const cast of casts) {
      for (const url of cast.embedUrls) {
        embedUrls.add(url);
      }
    }
    const content = await this.contentClient.getContents(Array.from(embedUrls));
    return content.reduce(
      (acc, content) => {
        acc[content.uri] = content;
        return acc;
      },
      {} as Record<string, UrlContentResponse>,
    );
  }

  async getChannelMap(casts: BaseFarcasterCastWithContext[]) {
    const urls = new Set<string>();
    for (const cast of casts) {
      if (cast.parentUrl) {
        urls.add(cast.parentUrl);
      }
    }
    const channels = await this.nookClient.getChannels(Array.from(urls));
    return channels.reduce(
      (acc, channel) => {
        acc[channel.id] = channel;
        return acc;
      },
      {} as Record<string, Channel>,
    );
  }

  formatCast(
    hash: string,
    castMap: Record<string, BaseFarcasterCastWithContext>,
    entityMap: Record<string, GetEntityResponse>,
    contentMap: Record<string, UrlContentResponse>,
    channelMap: Record<string, Channel>,
  ): FarcasterCastResponse | undefined {
    const cast = castMap[hash];
    if (!cast) return;
    return {
      ...cast,
      entity: entityMap[cast.fid],
      mentions: cast.mentions.map((mention) => ({
        entity: entityMap[mention.fid],
        position: mention.position,
      })),
      embedCasts: cast.embedHashes
        .map((hash) =>
          this.formatCast(hash, castMap, entityMap, contentMap, channelMap),
        )
        .filter(Boolean) as FarcasterCastResponse[],
      parent: cast.parentHash
        ? this.formatCast(
            cast.parentHash,
            castMap,
            entityMap,
            contentMap,
            channelMap,
          )
        : undefined,
      rootParent: cast.rootParentHash
        ? this.formatCast(
            cast.rootParentHash,
            castMap,
            entityMap,
            contentMap,
            channelMap,
          )
        : undefined,
      embeds: cast.embedUrls.map((url) => contentMap[url]),
      channel: cast.parentUrl ? channelMap[cast.parentUrl] : undefined,
    };
  }

  async getCastReplies(hash: string, viewerFid?: string) {
    const replies = await this.farcasterClient.fetchCastReplies(
      hash,
      viewerFid,
    );
    const casts = await this.getCasts(replies.data, viewerFid);
    return casts;
  }

  async getFeed(feedId: string, cursor?: number, viewerFid?: string) {
    const feed = await this.nookClient.getFeed(feedId, cursor);
    const startCursor = feed[0]?.score;
    const endCursor = feed[feed.length - 1]?.score;

    const promises = [];
    promises.push(
      this.farcasterClient
        .fetchCasts(
          feed.map((item) => item.value),
          viewerFid,
        )
        .then((response) => this.getCasts(response.data, viewerFid)),
    );

    if (!cursor) {
      promises.push(this.getNewFeedItems(feedId, startCursor, viewerFid));
    }

    if (feed.length < 25) {
      promises.push(
        this.backfillFeed(feedId, cursor || endCursor, 25 - feed.length).then(
          (response) => this.getCasts(response, viewerFid),
        ),
      );
    }

    const casts = (await Promise.all(promises))
      .flat()
      .sort((a, b) => {
        return b.timestamp - a.timestamp;
      })
      .slice(0, 25);

    return {
      data: casts,
      nextCursor: casts[casts.length - 1]?.timestamp,
    };
  }

  async getNewFeedItems(feedId: string, cursor?: number, viewerFid?: string) {
    const [type, subtype, id] = feedId.split(":");
    if (type !== "user" || subtype !== "following") {
      return [];
    }

    const response = await this.farcasterClient.fetchCastsFromFollowing(
      {
        fid: id,
        minCursor: cursor,
        limit: MAX_FEED_ITEMS,
      },
      viewerFid,
    );

    await this.nookClient.batchAddToFeed(
      feedId,
      response.data.map(({ hash, timestamp }) => ({
        value: hash,
        timestamp,
      })),
    );

    return await this.getCasts(response.data, viewerFid);
  }

  async backfillFeed(
    feedId: string,
    cursor?: number,
    take?: number,
    viewerFid?: string,
  ) {
    const [type, subtype, id] = feedId.split(":");

    let rawCasts: BaseFarcasterCastWithContext[] = [];
    if (type === "channel") {
      const response = await this.farcasterClient.fetchCastsByParentUrl(
        {
          parentUrl: id,
          maxCursor: cursor,
          limit: take,
        },
        viewerFid,
      );
      rawCasts = response.data;
    } else if (type === "user") {
      if (subtype === "following") {
        const response = await this.farcasterClient.fetchCastsFromFollowing(
          {
            fid: id,
            maxCursor: cursor,
            limit: take,
          },
          viewerFid,
        );
        rawCasts = response.data;
      } else {
        const response = await this.farcasterClient.fetchCastsFromFids(
          {
            fids: [id],
            replies: subtype === "replies",
            maxCursor: cursor,
            limit: take,
          },
          viewerFid,
        );
        rawCasts = response.data;
      }
    } else if (type === "custom") {
      if (subtype === "farcaster-og") {
        const response = await this.farcasterClient.fetchCastsFromFids(
          {
            fids: FARCASTER_OG_FIDS,
            replies: false,
            maxCursor: cursor,
            limit: take,
          },
          viewerFid,
        );
        rawCasts = response.data;
      }
    }

    await this.nookClient.batchAddToFeed(
      feedId,
      rawCasts.map(({ hash, timestamp }) => ({
        value: hash,
        timestamp,
      })),
    );

    return rawCasts;
  }
}
