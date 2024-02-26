import { MongoClient, MongoCollection } from "@nook/common/mongo";
import {
  ContentActionData,
  EntityActionData,
  EventAction,
  EventActionType,
  TopicType,
} from "@nook/common/types";

export enum EntityActionType {
  FOLLOWING = "following",
}

export enum ContentActionType {
  LIKED = "liked",
  REPOSTED = "reposted",
}

type EntityValidateActionsArgs = {
  client: MongoClient;
  viewerId: string;
  entityIds: string[];
};

type ContentValidateActionsArgs = {
  client: MongoClient;
  viewerId: string;
  contentIds: string[];
};

type EntityAction = {
  type: EntityActionType;
  validateActions: (
    args: EntityValidateActionsArgs,
  ) => Promise<Record<string, boolean>>;
};

type ContentAction = {
  type: ContentActionType;
  validateActions: (
    args: ContentValidateActionsArgs,
  ) => Promise<Record<string, boolean>>;
};

export const ENTITY_ACTIONS: Record<EntityActionType, EntityAction> = {
  [EntityActionType.FOLLOWING]: {
    type: EntityActionType.FOLLOWING,
    validateActions: async ({
      client,
      viewerId,
      entityIds,
    }: EntityValidateActionsArgs) => {
      const entities = await client
        .getCollection<EventAction<EntityActionData>>(MongoCollection.Actions)
        .find({
          type: EventActionType.FOLLOW,
          $and: [
            {
              topics: {
                $elemMatch: {
                  type: TopicType.SOURCE_ENTITY,
                  value: viewerId,
                },
              },
            },
            {
              topics: {
                $elemMatch: {
                  type: TopicType.TARGET_ENTITY,
                  value: { $in: entityIds },
                },
              },
            },
          ],
        })
        .toArray();

      const actedEntityIds = entities.map(
        (entity) => entity.data.targetEntityId,
      );

      return entityIds.reduce(
        (acc, entityId) => {
          acc[entityId] = actedEntityIds.includes(entityId);
          return acc;
        },
        {} as Record<string, boolean>,
      );
    },
  },
};

export const CONTENT_ACTIONS: Record<ContentActionType, ContentAction> = {
  [ContentActionType.LIKED]: {
    type: ContentActionType.LIKED,
    validateActions: async ({
      client,
      viewerId,
      contentIds,
    }: ContentValidateActionsArgs) => {
      const entities = await client
        .getCollection<EventAction<ContentActionData>>(MongoCollection.Actions)
        .find({
          type: EventActionType.LIKE,
          $and: [
            {
              topics: {
                $elemMatch: {
                  type: TopicType.SOURCE_ENTITY,
                  value: viewerId,
                },
              },
            },
            {
              topics: {
                $elemMatch: {
                  type: TopicType.TARGET_CONTENT,
                  value: { $in: contentIds },
                },
              },
            },
          ],
        })
        .toArray();

      const actedContentIds = entities.map((entity) => entity.data.contentId);

      return contentIds.reduce(
        (acc, contentId) => {
          acc[contentId] = actedContentIds.includes(contentId);
          return acc;
        },
        {} as Record<string, boolean>,
      );
    },
  },
  [ContentActionType.REPOSTED]: {
    type: ContentActionType.REPOSTED,
    validateActions: async ({
      client,
      viewerId,
      contentIds,
    }: ContentValidateActionsArgs) => {
      const entities = await client
        .getCollection<EventAction<ContentActionData>>(MongoCollection.Actions)
        .find({
          type: EventActionType.REPOST,
          $and: [
            {
              topics: {
                type: TopicType.SOURCE_ENTITY,
                value: viewerId,
              },
            },
            {
              topics: {
                type: TopicType.TARGET_CONTENT,
                value: { $in: contentIds },
              },
            },
          ],
        })
        .toArray();

      const actedContentIds = entities.map((entity) => entity.data.contentId);

      return contentIds.reduce(
        (acc, contentId) => {
          acc[contentId] = actedContentIds.includes(contentId);
          return acc;
        },
        {} as Record<string, boolean>,
      );
    },
  },
};
