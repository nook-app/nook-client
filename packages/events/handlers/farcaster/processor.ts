import { getOrCreateEntitiesForFids } from "@nook/common/entity";
import { MongoClient } from "@nook/common/mongo";
import {
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
  RawEvent,
} from "@nook/common/types";
import { transformUserDataAddEvent } from "./transformers/userDataAdd";
import {
  getOrCreatePostContent,
  getOrCreatePostContentFromData,
} from "../../utils/farcaster";
import { transformCastAddOrRemove } from "./transformers/castAddOrRemove";
import { toFarcasterURI } from "@nook/common/farcaster";
import { transformCastReactionAddOrRemove } from "./transformers/castReactionAddOrRemove";
import { transformLinkAddOrRemove } from "./transformers/linkAddOrRemove";
import { transformUrlReactionAddOrRemove } from "./transformers/urlReactionAddOrRemove";
import { transformUsernameProofAdd } from "./transformers/usernameProofAdd";
import { transformVerificationAddOrRemove } from "./transformers/verificationAddOrRemove";
import { RedisClient } from "@nook/common/cache";

export class FarcasterProcessor {
  private client: MongoClient;
  private redis: RedisClient;

  constructor(client: MongoClient, redis: RedisClient) {
    this.client = client;
    this.redis = redis;
  }

  async process(rawEvent: RawEvent<EntityEventData>) {
    switch (rawEvent.source.type) {
      case EventType.CAST_ADD:
      case EventType.CAST_REMOVE:
        return this.processCastAddOrRemove(
          rawEvent as RawEvent<FarcasterCastData>,
        );
      case EventType.CAST_REACTION_ADD:
      case EventType.CAST_REACTION_REMOVE:
        return this.processCastReactionAddOrRemove(
          rawEvent as RawEvent<FarcasterCastReactionData>,
        );
      case EventType.URL_REACTION_ADD:
      case EventType.URL_REACTION_REMOVE:
        return this.processUrlReactionAddOrRemove(
          rawEvent as RawEvent<FarcasterUrlReactionData>,
        );
      case EventType.LINK_ADD:
      case EventType.LINK_REMOVE:
        return this.processLinkAddOrRemove(
          rawEvent as RawEvent<FarcasterLinkData>,
        );
      case EventType.USER_DATA_ADD:
        return this.processUserDataAdd(
          rawEvent as RawEvent<FarcasterUserDataAddData>,
        );
      case EventType.VERIFICATION_ADD:
      case EventType.VERIFICATION_REMOVE:
        return this.processVerificationAddOrRemove(
          rawEvent as RawEvent<FarcasterVerificationData>,
        );
      default:
        throw new Error(
          `[${rawEvent.source.service}] [${rawEvent.source.type}] no handler found`,
        );
    }
  }

  async processUserDataAdd(rawEvent: RawEvent<FarcasterUserDataAddData>) {
    const entities = await this.fetchEntities([rawEvent.data.fid]);
    return transformUserDataAddEvent(rawEvent, entities);
  }

  async processCastAddOrRemove(rawEvent: RawEvent<FarcasterCastData>) {
    const content = await getOrCreatePostContentFromData(
      this.client,
      rawEvent.data,
    );
    return transformCastAddOrRemove(rawEvent, content);
  }

  async processCastReactionAddOrRemove(
    rawEvent: RawEvent<FarcasterCastReactionData>,
  ) {
    const content = await getOrCreatePostContent(
      this.client,
      toFarcasterURI({
        fid: rawEvent.data.targetFid,
        hash: rawEvent.data.targetHash,
      }),
    );
    if (!content) return;
    const entities = await this.fetchEntities([rawEvent.data.fid]);
    return transformCastReactionAddOrRemove(rawEvent, content, entities);
  }

  async processLinkAddOrRemove(rawEvent: RawEvent<FarcasterLinkData>) {
    const entities = await this.fetchEntities([
      rawEvent.data.fid,
      rawEvent.data.targetFid,
    ]);
    return transformLinkAddOrRemove(rawEvent, entities);
  }

  async processUrlReactionAddOrRemove(
    rawEvent: RawEvent<FarcasterUrlReactionData>,
  ) {
    const entities = await this.fetchEntities([rawEvent.data.fid]);
    return transformUrlReactionAddOrRemove(rawEvent, entities);
  }

  async processUsernameProofAdd(
    rawEvent: RawEvent<FarcasterUsernameProofData>,
  ) {
    const entities = await this.fetchEntities([rawEvent.data.fid]);
    return transformUsernameProofAdd(rawEvent, entities);
  }

  async processVerificationAddOrRemove(
    rawEvent: RawEvent<FarcasterVerificationData>,
  ) {
    const entities = await this.fetchEntities([rawEvent.data.fid]);
    return transformVerificationAddOrRemove(rawEvent, entities);
  }

  async fetchEntities(fids: string[]) {
    const cachedEntities = (
      await Promise.all(fids.map((fid) => this.redis.getEntityByFid(fid)))
    ).filter(Boolean) as Entity[];
    const missingEntities = fids.filter(
      (fid) => !cachedEntities.find((entity) => entity.farcaster.fid === fid),
    );

    console.log({
      cached: cachedEntities.length,
      missing: missingEntities.length,
    });

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
}
