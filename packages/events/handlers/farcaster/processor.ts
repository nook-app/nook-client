import { getOrCreateEntitiesForFids } from "@nook/common/entity";
import { MongoClient, MongoCollection } from "@nook/common/mongo";
import {
  Content,
  ContentData,
  Entity,
  EntityEventData,
  EventType,
  FarcasterCastData,
  FarcasterCastReactionData,
  FarcasterLinkData,
  FarcasterUrlReactionData,
  FarcasterUserDataAddData,
  FarcasterUsernameProofData,
  FarcasterVerificationData,
  PostData,
  RawEvent,
} from "@nook/common/types";
import { transformUserDataAddEvent } from "./transformers/userDataAdd";
import { transformCastAddOrRemove } from "./transformers/castAddOrRemove";
import { toFarcasterURI } from "@nook/common/farcaster";
import { transformCastReactionAddOrRemove } from "./transformers/castReactionAddOrRemove";
import { transformLinkAddOrRemove } from "./transformers/linkAddOrRemove";
import { transformUrlReactionAddOrRemove } from "./transformers/urlReactionAddOrRemove";
import { transformUsernameProofAdd } from "./transformers/usernameProofAdd";
import { transformVerificationAddOrRemove } from "./transformers/verificationAddOrRemove";
import { RedisClient } from "@nook/common/cache";
import {
  extractFidFromCast,
  extractRelatedCastsFromCast,
  formatPostContent,
} from "./utils";
import { EventHandlerResponse, EventHandlerResponseEvent } from "../../types";

export class FarcasterProcessor {
  client: MongoClient;
  redis: RedisClient;

  constructor(client: MongoClient, redis: RedisClient) {
    this.client = client;
    this.redis = redis;
  }

  async process(
    rawEvent: RawEvent<EntityEventData>,
  ): Promise<EventHandlerResponse> {
    switch (rawEvent.source.type) {
      case EventType.CAST_ADD:
      case EventType.CAST_REMOVE:
        return await this.processCastAddOrRemove([
          rawEvent as RawEvent<FarcasterCastData>,
        ]);
      case EventType.CAST_REACTION_ADD:
      case EventType.CAST_REACTION_REMOVE:
        return await this.processCastReactionAddOrRemove([
          rawEvent as RawEvent<FarcasterCastReactionData>,
        ]);
      case EventType.URL_REACTION_ADD:
      case EventType.URL_REACTION_REMOVE:
        return await this.processUrlReactionAddOrRemove([
          rawEvent as RawEvent<FarcasterUrlReactionData>,
        ]);
      case EventType.LINK_ADD:
      case EventType.LINK_REMOVE:
        return await this.processLinkAddOrRemove([
          rawEvent as RawEvent<FarcasterLinkData>,
        ]);
      case EventType.USER_DATA_ADD:
        return await this.processUserDataAdd([
          rawEvent as RawEvent<FarcasterUserDataAddData>,
        ]);
      case EventType.USERNAME_PROOF:
        return await this.processUsernameProofAdd([
          rawEvent as RawEvent<FarcasterUsernameProofData>,
        ]);
      case EventType.VERIFICATION_ADD:
      case EventType.VERIFICATION_REMOVE:
        return await this.processVerificationAddOrRemove([
          rawEvent as RawEvent<FarcasterVerificationData>,
        ]);
      default:
        throw new Error(
          `[${rawEvent.source.service}] [${rawEvent.source.type}] no handler found`,
        );
    }
  }

  async processUserDataAdd(
    rawEvents: RawEvent<FarcasterUserDataAddData>[],
  ): Promise<EventHandlerResponse> {
    const fids = rawEvents.map((event) => event.data.fid);
    const entities = await this.fetchEntities(fids);
    return {
      events: rawEvents.map((event) =>
        transformUserDataAddEvent(event, entities),
      ),
    };
  }

  async processCastAddOrRemove(
    rawEvents: RawEvent<FarcasterCastData>[],
  ): Promise<EventHandlerResponse> {
    const contentIds = rawEvents.map((event) => toFarcasterURI(event.data));
    const { contentMap, newContents } = await this.fetchCasts(contentIds);
    const events = rawEvents.map((event) =>
      contentMap[toFarcasterURI(event.data)]
        ? transformCastAddOrRemove(
            event,
            contentMap[toFarcasterURI(event.data)],
          )
        : undefined,
    );
    return {
      events: events.filter(Boolean) as EventHandlerResponseEvent[],
      contents: newContents,
    };
  }

  async processCastReactionAddOrRemove(
    rawEvents: RawEvent<FarcasterCastReactionData>[],
  ): Promise<EventHandlerResponse> {
    const contentIds = rawEvents.map((event) =>
      toFarcasterURI({
        fid: event.data.targetFid,
        hash: event.data.targetHash,
      }),
    );
    const { contentMap, newContents } = await this.fetchCasts(contentIds);
    const entities = await this.fetchEntities(
      rawEvents.map((event) => event.data.fid),
    );
    const events = rawEvents.map((event) =>
      contentMap[
        toFarcasterURI({
          fid: event.data.targetFid,
          hash: event.data.targetHash,
        })
      ]
        ? transformCastReactionAddOrRemove(
            event,
            contentMap[
              toFarcasterURI({
                fid: event.data.targetFid,
                hash: event.data.targetHash,
              })
            ],
            entities,
          )
        : undefined,
    );
    return {
      events: events.filter(Boolean) as EventHandlerResponseEvent[],
      contents: newContents,
    };
  }

  async processLinkAddOrRemove(
    rawEvents: RawEvent<FarcasterLinkData>[],
  ): Promise<EventHandlerResponse> {
    const entities = await this.fetchEntities(
      rawEvents.flatMap((event) => [event.data.fid, event.data.targetFid]),
    );
    return {
      events: rawEvents.map((event) =>
        transformLinkAddOrRemove(event, entities),
      ),
    };
  }

  async processUrlReactionAddOrRemove(
    rawEvents: RawEvent<FarcasterUrlReactionData>[],
  ): Promise<EventHandlerResponse> {
    const entities = await this.fetchEntities(
      rawEvents.map((event) => event.data.fid),
    );
    return {
      events: rawEvents.map((event) =>
        transformUrlReactionAddOrRemove(event, entities),
      ),
    };
  }

  async processUsernameProofAdd(
    rawEvents: RawEvent<FarcasterUsernameProofData>[],
  ): Promise<EventHandlerResponse> {
    const entities = await this.fetchEntities(
      rawEvents.map((event) => event.data.fid),
    );
    return {
      events: rawEvents.map((event) =>
        transformUsernameProofAdd(event, entities),
      ),
    };
  }

  async processVerificationAddOrRemove(
    rawEvents: RawEvent<FarcasterVerificationData>[],
  ): Promise<EventHandlerResponse> {
    const entities = await this.fetchEntities(
      rawEvents.map((event) => event.data.fid),
    );
    return {
      events: rawEvents.map((event) =>
        transformVerificationAddOrRemove(event, entities),
      ),
    };
  }

  async fetchEntities(fids: string[]) {
    if (fids.length === 0) return {};
    const uniqueFids = Array.from(new Set(fids));
    const cachedEntities = (
      await Promise.all(uniqueFids.map((fid) => this.redis.getEntityByFid(fid)))
    ).filter(Boolean) as Entity[];
    const missingEntities = uniqueFids.filter(
      (fid) => !cachedEntities.find((entity) => entity.farcaster.fid === fid),
    );

    const fetchedEntityMap = await getOrCreateEntitiesForFids(
      this.client,
      missingEntities,
    );

    await Promise.all(
      Object.values(fetchedEntityMap).map((entity) =>
        this.redis.setEntity(entity),
      ),
    );

    return {
      ...cachedEntities.reduce(
        (acc, entity) => {
          acc[entity.farcaster.fid] = entity;
          return acc;
        },
        {} as Record<string, Entity>,
      ),
      ...fetchedEntityMap,
    };
  }

  async fetchCasts(contentIds: string[]) {
    // 1. Get casts from cache
    const cachedCasts = await this.fetchCastsFromCache(contentIds);
    const contentMap = cachedCasts.reduce(
      (acc, cast) => {
        acc[cast.contentId] = cast;
        return acc;
      },
      {} as Record<string, Content<PostData>>,
    );

    // 2. Get casts from storage (Mongo)
    const uncachedCasts = contentIds.filter(
      (contentId) => !contentMap[contentId],
    );
    const storedCasts = await this.fetchCastsFromStorage(uncachedCasts);
    for (const cast of storedCasts) {
      contentMap[cast.contentId] = cast;
    }

    // 3. Get raw casts from source (Farcaster DB) and transform them into Content<PostData>
    const unstoredCasts = uncachedCasts.filter(
      (contentId) => !contentMap[contentId],
    );
    const rawCasts = await this.fetchCastsFromSource(unstoredCasts);

    const rawParentCastIds = Array.from(
      new Set(rawCasts.flatMap(extractRelatedCastsFromCast)),
    ).filter((contentId) => !contentMap[contentId]);
    const rawParentCasts = await this.fetchCastsFromSource(rawParentCastIds);

    const rawSecondaryParentCastIds = Array.from(
      new Set(rawParentCasts.flatMap(extractRelatedCastsFromCast)),
    ).filter((contentId) => !contentMap[contentId]);
    const rawSecondaryParentCasts = await this.fetchCastsFromSource(
      rawSecondaryParentCastIds,
    );

    // 4. Get fid to entity mapping for raw casts
    const fids = Array.from(
      new Set(
        rawCasts
          .concat(rawParentCasts)
          .concat(rawSecondaryParentCasts)
          .flatMap(extractFidFromCast),
      ),
    );
    const entities = await this.fetchEntities(fids);

    // 5. Transform raw casts into Content<PostData> in reverse from secondary parent to primary cast
    const tempContentMap = { ...contentMap };
    const secondaryParentCasts = rawSecondaryParentCasts.map((cast) =>
      formatPostContent(cast, entities, contentMap),
    );
    for (const content of secondaryParentCasts) {
      tempContentMap[content.contentId] = content;
    }

    const newContentMap: Record<string, Content<ContentData>> = {};
    const parentCasts = rawParentCasts.map((cast) =>
      formatPostContent(cast, entities, tempContentMap),
    );
    for (const content of parentCasts) {
      tempContentMap[content.contentId] = content;
      contentMap[content.contentId] = content;
      newContentMap[content.contentId] = content;
    }

    const casts = rawCasts.map((cast) =>
      formatPostContent(cast, entities, tempContentMap),
    );
    for (const content of casts) {
      contentMap[content.contentId] = content;
      newContentMap[content.contentId] = content;
    }

    // 6. Update cache with new casts
    await this.redis.setContents(storedCasts);
    await this.redis.setContents(secondaryParentCasts);
    await this.redis.setContents(parentCasts);
    await this.redis.setContents(casts);

    return { contentMap, newContents: Object.values(newContentMap) };
  }

  async fetchCastsFromCache(contentIds: string[]) {
    const cacheResults = await this.redis.getContents(contentIds);
    return cacheResults.filter(Boolean) as Content<PostData>[];
  }

  async fetchCastsFromStorage(contentIds: string[]) {
    if (contentIds.length === 0) return [];
    return await this.client
      .getCollection<Content<PostData>>(MongoCollection.Content)
      .find({
        contentId: { $in: contentIds },
      })
      .toArray();
  }

  async fetchCastsFromSource(contentIds: string[]) {
    if (contentIds.length === 0) return [];
    const response = await fetch(`${process.env.FARCASTER_SERVICE_URL}/casts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: contentIds }),
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch content from source: ${await response.text()}`,
      );
    }
    const { casts } = await response.json();
    return casts as FarcasterCastData[];
  }
}
