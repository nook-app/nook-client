import {
  ContentEngagementType,
  EventAction,
  EventActionType,
  Entity,
  PostActionData,
  EntityActionData,
  EventActionRequest,
} from "@flink/common/types";
import { MongoClient, MongoCollection } from "@flink/common/mongo";
import { handleFollowRelation } from "@flink/common/relations";
import { insertPostContent } from "@flink/content/utils";
import { Job } from "bullmq";

export const getActionsHandler = async () => {
  const client = new MongoClient();
  await client.connect();

  return async (job: Job<EventActionRequest>) => {
    const data = await client.findAction(job.data.actionId);

    switch (data.type) {
      case EventActionType.POST: {
        const action = data as EventAction<PostActionData>;
        await insertPostContent(
          client,
          action.data.contentId,
          action.data.content,
        );
        break;
      }
      case EventActionType.UNPOST: {
        const action = data as EventAction<PostActionData>;
        await Promise.all([
          client.markActionsDeleted(action.source.id),
          client.markContentDeleted(action.data.contentId),
        ]);
        break;
      }
      case EventActionType.REPLY: {
        const action = data as EventAction<PostActionData>;
        await insertPostContent(
          client,
          action.data.contentId,
          action.data.content,
        );
        if (job.data.created) {
          await Promise.all([
            void client.incrementEngagement(
              action.data.content.parentId,
              ContentEngagementType.REPLIES,
            ),
            void client.incrementEngagement(
              action.data.content.rootParentId,
              ContentEngagementType.ROOT_REPLIES,
            ),
          ]);
        }
        break;
      }
      case EventActionType.UNREPLY: {
        const action = data as EventAction<PostActionData>;
        const promises = [
          client.markActionsDeleted(action.source.id),
          client.markContentDeleted(action.data.contentId),
        ];
        if (job.data.created) {
          promises.push(
            client.incrementEngagement(
              action.data.content.parentId,
              ContentEngagementType.REPLIES,
              true,
            ),
            client.incrementEngagement(
              action.data.content.rootParentId,
              ContentEngagementType.ROOT_REPLIES,
              true,
            ),
          );
        }
        await Promise.all(promises);
        break;
      }
      case EventActionType.LIKE: {
        const action = data as EventAction<PostActionData>;
        await insertPostContent(
          client,
          action.data.contentId,
          action.data.content,
        );
        if (job.data.created) {
          await client.incrementEngagement(
            action.data.contentId,
            ContentEngagementType.LIKES,
          );
        }
        break;
      }
      case EventActionType.UNLIKE: {
        const action = data as EventAction<PostActionData>;
        const promises = [client.markActionsDeleted(action.source.id)];
        if (job.data.created) {
          promises.push(
            client.incrementEngagement(
              action.data.contentId,
              ContentEngagementType.LIKES,
              true,
            ),
          );
        }
        await Promise.all(promises);
        break;
      }
      case EventActionType.REPOST: {
        const action = data as EventAction<PostActionData>;
        await insertPostContent(
          client,
          action.data.contentId,
          action.data.content,
        );
        if (job.data.created) {
          await client.incrementEngagement(
            action.data.contentId,
            ContentEngagementType.REPOSTS,
          );
        }
        break;
      }
      case EventActionType.UNREPOST: {
        const action = data as EventAction<PostActionData>;
        const promises = [client.markActionsDeleted(action.source.id)];
        if (job.data.created) {
          promises.push(
            void client.incrementEngagement(
              action.data.contentId,
              ContentEngagementType.REPOSTS,
              true,
            ),
          );
        }
        await Promise.all(promises);
        break;
      }
      case EventActionType.FOLLOW: {
        const action = data as EventAction<EntityActionData>;
        const promises = [
          handleFollowRelation(
            action.data.entityId.toString(),
            action.data.targetEntityId.toString(),
          ),
        ];
        if (job.data.created) {
          const collection = client.getCollection<Entity>(
            MongoCollection.Entity,
          );
          promises.push(
            void collection.updateOne(
              {
                _id: action.data.entityId,
                "farcasterAccounts.id": action.data.sourceEntityId,
              },
              { $inc: { "farcasterAccounts.$.following": 1 } },
            ),
            void collection.updateOne(
              {
                _id: action.data.targetEntityId,
                "farcasterAccounts.id": action.data.sourceTargetEntityId,
              },
              { $inc: { "farcasterAccounts.$.followers": 1 } },
            ),
          );
        }
        await Promise.all(promises);
        break;
      }
      case EventActionType.UNFOLLOW: {
        const action = data as EventAction<EntityActionData>;
        const promises = [
          client.markActionsDeleted(data.source.id),
          handleFollowRelation(
            action.data.entityId.toString(),
            action.data.targetEntityId.toString(),
            true,
          ),
        ];
        if (job.data.created) {
          const collection = client.getCollection<Entity>(
            MongoCollection.Entity,
          );
          promises.push(
            void collection.updateOne(
              {
                _id: action.data.entityId,
                "farcasterAccounts.id": action.data.sourceEntityId,
              },
              { $inc: { "farcasterAccounts.$.following": 1 } },
            ),
            void collection.updateOne(
              {
                _id: action.data.targetEntityId,
                "farcasterAccounts.id": action.data.sourceTargetEntityId,
              },
              { $inc: { "farcasterAccounts.$.followers": 1 } },
            ),
          );
        }
        await Promise.all(promises);
        break;
      }
      default:
        throw new Error(`[${data.type}] no handler found`);
    }

    console.log(
      `[${data.type}] processed ${data.source.id} by ${data.entityId}`,
    );
  };
};
