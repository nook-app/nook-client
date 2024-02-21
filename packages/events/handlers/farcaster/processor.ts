import { getOrCreateEntitiesForFids } from "@nook/common/entity";
import { MongoClient } from "@nook/common/mongo";
import {
  Content,
  ContentType,
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
  Topic,
  TopicType,
} from "@nook/common/types";
import { transformUserDataAddEvent } from "./transformers/userDataAdd";
import { transformCastAddOrRemove } from "./transformers/castAddOrRemove";
import { fromFarcasterURI, toFarcasterURI } from "@nook/common/farcaster";
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
        return await this.processCastAddOrRemove(
          rawEvent as RawEvent<FarcasterCastData>,
        );
      case EventType.CAST_REACTION_ADD:
      case EventType.CAST_REACTION_REMOVE:
        return await this.processCastReactionAddOrRemove(
          rawEvent as RawEvent<FarcasterCastReactionData>,
        );
      case EventType.URL_REACTION_ADD:
      case EventType.URL_REACTION_REMOVE:
        return await this.processUrlReactionAddOrRemove(
          rawEvent as RawEvent<FarcasterUrlReactionData>,
        );
      case EventType.LINK_ADD:
      case EventType.LINK_REMOVE:
        return await this.processLinkAddOrRemove(
          rawEvent as RawEvent<FarcasterLinkData>,
        );
      case EventType.USER_DATA_ADD:
        return await this.processUserDataAdd(
          rawEvent as RawEvent<FarcasterUserDataAddData>,
        );
      case EventType.VERIFICATION_ADD:
      case EventType.VERIFICATION_REMOVE:
        return await this.processVerificationAddOrRemove(
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
    const content = await this.fetchContent(
      toFarcasterURI(rawEvent.data),
      rawEvent.data,
    );
    return transformCastAddOrRemove(rawEvent, content);
  }

  async processCastReactionAddOrRemove(
    rawEvent: RawEvent<FarcasterCastReactionData>,
  ) {
    const content = await this.fetchContent(
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

  async fetchContent(
    contentId: string,
    data?: FarcasterCastData,
    fetchNested = true,
  ) {
    const cachedContent = await this.redis.getContent(contentId);
    if (cachedContent) return cachedContent as Content<PostData>;
    const existingContent = await this.client.findContent(contentId);
    if (existingContent) {
      await this.redis.setContent(existingContent);
      return existingContent as Content<PostData>;
    }

    const cast = data || (await this.fetchContentFromSource(contentId));
    const content = await this.createPostContent(cast, fetchNested);
    await this.redis.setContent(content);
    return content;
  }

  async fetchContentFromSource(contentId: string) {
    const { fid, hash } = fromFarcasterURI(contentId);
    const response = await fetch(
      `${process.env.FARCASTER_API_URL}/cast/${fid}/${hash}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch content for ${contentId}`);
    }
    return (await response.json()) as FarcasterCastData;
  }

  async createPostContent(cast: FarcasterCastData, fetchNested = true) {
    const entities = await this.fetchEntities(
      Array.from(
        new Set(
          [
            cast.fid,
            cast.parentFid,
            cast.rootParentFid,
            ...cast.mentions.map((mention) => mention.mention),
          ].filter(Boolean) as string[],
        ),
      ),
    );

    const content = this.formatContent(cast, entities);

    if (!cast.parentFid || !cast.parentHash) {
      return content;
    }

    const parentId = toFarcasterURI({
      fid: cast.parentFid,
      hash: cast.parentHash,
    });

    const rootParentId = toFarcasterURI({
      fid: cast.rootParentFid,
      hash: cast.rootParentHash,
    });

    if (!fetchNested) {
      content.data.parentId = parentId;
      content.data.rootParentId = rootParentId;
      return content;
    }

    const parent = await this.fetchContent(parentId, undefined, false);
    if (parent) {
      content.data.parent = parent.data;
      content.data.parentId = parentId;
      content.data.parentEntityId = parent.data.entityId;
    }

    const rootParent = await this.fetchContent(rootParentId, undefined, false);
    if (rootParent) {
      content.data.rootParent = rootParent.data;
      content.data.rootParentId = rootParentId;
      content.data.rootParentEntityId = rootParent.data.entityId;
    }

    return content;
  }

  formatContent(
    cast: FarcasterCastData,
    entities: Record<string, Entity>,
  ): Content<PostData> {
    const data: PostData = {
      contentId: toFarcasterURI(cast),
      text: cast.text,
      timestamp: new Date(cast.timestamp),
      entityId: entities[cast.fid]._id.toString(),
      mentions: cast.mentions.map(({ mention, mentionPosition }) => ({
        entityId: entities[mention]._id.toString(),
        position: parseInt(mentionPosition),
      })),
      embeds: cast.embeds,
      channelId: cast.rootParentUrl,
      parentId:
        cast.parentFid && cast.parentHash
          ? toFarcasterURI({
              fid: cast.parentFid,
              hash: cast.parentHash,
            })
          : undefined,
      rootParentId: toFarcasterURI({
        fid: cast.rootParentFid,
        hash: cast.rootParentHash,
      }),
      rootParentEntityId: entities[cast.rootParentFid]._id.toString(),
    };
    return {
      contentId: data.contentId,
      createdAt: new Date(),
      updatedAt: new Date(),
      timestamp: new Date(data.timestamp),
      type: data.parentId ? ContentType.REPLY : ContentType.POST,
      data,
      engagement: {
        likes: 0,
        reposts: 0,
        replies: 0,
        embeds: 0,
      },
      tips: {},
      topics: this.generateTopics(data),
      referencedEntityIds: Array.from(
        new Set([
          data.entityId,
          data.parentEntityId,
          data.rootParentEntityId,
          ...data.mentions.map(({ entityId }) => entityId),
        ]),
      ).filter(Boolean) as string[],
      referencedContentIds: Array.from(
        new Set([
          data.contentId,
          data.rootParentId,
          data.parentId,
          ...data.embeds,
          data.channelId,
        ]),
      ).filter(Boolean) as string[],
    };
  }

  generateTopics(data: PostData) {
    const topics: Topic[] = [
      {
        type: TopicType.SOURCE_ENTITY,
        value: data.entityId.toString(),
      },
      {
        type: TopicType.SOURCE_CONTENT,
        value: data.contentId,
      },
      {
        type: TopicType.ROOT_TARGET_ENTITY,
        value: data.rootParentEntityId.toString(),
      },
      {
        type: TopicType.ROOT_TARGET_CONTENT,
        value: data.rootParentId,
      },
    ];

    for (const mention of data.mentions) {
      topics.push({
        type: TopicType.SOURCE_TAG,
        value: mention.entityId.toString(),
      });
    }

    for (const embed of data.embeds) {
      topics.push({
        type: TopicType.SOURCE_EMBED,
        value: embed,
      });
    }

    if (data.parentId && data.parentEntityId) {
      topics.push({
        type: TopicType.TARGET_ENTITY,
        value: data.parentEntityId.toString(),
      });
      topics.push({
        type: TopicType.TARGET_CONTENT,
        value: data.parentId,
      });

      if (data.parent) {
        for (const mention of data.parent.mentions) {
          topics.push({
            type: TopicType.TARGET_TAG,
            value: mention.entityId.toString(),
          });
        }

        for (const embed of data.parent.embeds) {
          topics.push({
            type: TopicType.TARGET_EMBED,
            value: embed,
          });
        }
      }
    }

    if (data.rootParent) {
      for (const mention of data.rootParent.mentions) {
        topics.push({
          type: TopicType.ROOT_TARGET_TAG,
          value: mention.entityId.toString(),
        });
      }

      for (const embed of data.rootParent.embeds) {
        topics.push({
          type: TopicType.ROOT_TARGET_EMBED,
          value: embed,
        });
      }
    }

    if (data.channelId) {
      topics.push({
        type: TopicType.CHANNEL,
        value: data.channelId,
      });
    }

    return topics;
  }
}
