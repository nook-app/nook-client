import {
  EntityClient,
  FarcasterClient,
  FeedClient,
} from "@nook/common/clients";
import {
  FarcasterCast,
  FarcasterCastEmbedCast,
  FarcasterCastMention,
  Prisma,
} from "@nook/common/prisma/farcaster";
import { EntityEvent, FarcasterEventType, FidHash } from "@nook/common/types";

export class FarcasterProcessor {
  private entityClient: EntityClient;
  private farcasterClient: FarcasterClient;
  private feedClient: FeedClient;

  constructor() {
    this.entityClient = new EntityClient();
    this.farcasterClient = new FarcasterClient();
    this.feedClient = new FeedClient();
  }

  async process(event: EntityEvent) {
    switch (event.source.type) {
      case FarcasterEventType.CAST_ADD: {
        await this.processCastAdd(event.data as FarcasterCast);
        break;
      }
      default:
        // console.error(`Unknown event type: ${event.source.type}`);
        return;
    }
  }

  async processCastAdd(data: FarcasterCast) {
    const cast = await this.farcasterClient.getCast(data.hash);
    const fids = this.getFidsFromCast(cast);
    await this.entityClient.getEntitiesByFid(fids);
    if (data.parentUrl) {
      console.log("ahh im feeding");
      await this.feedClient.addToFeed(data.parentUrl, cast.hash);
    }
  }

  getFidsFromCast(cast: FarcasterCast) {
    const fids = new Set<bigint>();
    fids.add(cast.fid);

    if (cast.parentFid) {
      fids.add(cast.parentFid);
    }

    if (cast.rootParentFid) {
      fids.add(cast.rootParentFid);
    }

    for (const { mention } of this.getMentions(cast)) {
      fids.add(mention);
    }

    for (const { fid } of this.getCastEmbeds(cast)) {
      fids.add(fid);
    }

    return Array.from(fids);
  }

  getMentions(data: FarcasterCast) {
    const mentions = [];
    // @ts-ignore
    if (data.rawMentions && data.rawMentions !== Prisma.DbNull) {
      for (const mention of data.rawMentions as unknown as FarcasterCastMention[]) {
        mentions.push({
          mention: mention.mention,
          mentionPosition: mention.mentionPosition,
        });
      }
    }
    return mentions;
  }

  getUrlEmbeds(data: FarcasterCast) {
    const embeds: string[] = [];
    // @ts-ignore
    if (data.rawUrlEmbeds && data.rawUrlEmbeds !== Prisma.DbNull) {
      for (const url of data.rawUrlEmbeds as string[]) {
        embeds.push(url);
      }
    }
    return embeds;
  }

  getCastEmbeds(data: FarcasterCast) {
    const embeds: FidHash[] = [];
    if (
      data.rawCastEmbeds &&
      (data.rawCastEmbeds as unknown) !== Prisma.DbNull
    ) {
      for (const embed of data.rawCastEmbeds as unknown as FarcasterCastEmbedCast[]) {
        embeds.push({ fid: embed.fid, hash: embed.embedHash });
      }
    }
    return embeds;
  }
}
