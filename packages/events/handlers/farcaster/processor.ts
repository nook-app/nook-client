import { getOrCreateEntitiesForFids } from "@nook/common/entity";
import { MongoClient } from "@nook/common/mongo";
import {
  Entity,
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

export class FarcasterProcessor {
  private client: MongoClient;
  private fidCache: Record<string, Entity>;

  constructor(client: MongoClient) {
    this.client = client;
    this.fidCache = {};
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
    const cachedFids = fids.map((fid) => this.fidCache[fid]).filter(Boolean);
    const missingFids = fids.filter((fid) => !this.fidCache[fid]);

    const fetchedFids = await getOrCreateEntitiesForFids(
      this.client,
      missingFids,
    );

    this.fidCache = {
      ...this.fidCache,
      ...fetchedFids,
    };

    return {
      ...cachedFids.reduce(
        (acc, entity) => {
          acc[entity.farcaster.fid] = entity;
          return acc;
        },
        {} as Record<string, Entity>,
      ),
      ...fetchedFids,
    };
  }
}
