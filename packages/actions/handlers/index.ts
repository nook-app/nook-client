import {
  ContentEngagementType,
  EventAction,
  EventActionData,
  EventActionType,
  Entity,
  PostActionData,
  EntityActionData,
} from "@flink/common/types";
import { MongoClient, MongoCollection } from "@flink/common/mongo";
import { handleFollowRelation } from "@flink/common/relations";
import { createPostContent } from "@flink/content/utils";
import { Job } from "bullmq";
import { ObjectId } from "mongodb";

export const getActionsHandler = async () => {
  const client = new MongoClient();
  await client.connect();

  return async (job: Job<EventAction<EventActionData>>) => {
    const created = await client.upsertAction(job.data);

    switch (job.data.type) {
      case EventActionType.POST: {
        const action = job.data as EventAction<PostActionData>;
        await createPostContent(
          client,
          action.data.contentId,
          action.data.content,
        );
        break;
      }
      case EventActionType.UNPOST: {
        const action = job.data as EventAction<PostActionData>;
        await Promise.all([
          client.markActionsDeleted(action.source.id),
          client.markContentDeleted(action.data.contentId),
        ]);
        break;
      }
      case EventActionType.REPLY: {
        const action = job.data as EventAction<PostActionData>;
        if (!(await client.findContent(action.data.contentId))) {
          await createPostContent(
            client,
            action.data.contentId,
            action.data.content,
          );
          if (created) {
            await Promise.all([
              client.incrementEngagement(
                action.data.content.parentId,
                ContentEngagementType.REPLIES,
              ),
              client.incrementEngagement(
                action.data.content.rootParentId,
                ContentEngagementType.ROOT_REPLIES,
              ),
            ]);
          }
        }
        break;
      }
      case EventActionType.UNREPLY: {
        const action = job.data as EventAction<PostActionData>;
        await Promise.all([
          client.markActionsDeleted(action.source.id),
          client.markContentDeleted(action.data.contentId),
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
        ]);
        break;
      }
      case EventActionType.LIKE: {
        const action = job.data as EventAction<PostActionData>;
        if (!(await client.findContent(action.data.contentId))) {
          await createPostContent(
            client,
            action.data.contentId,
            action.data.content,
          );
          if (created) {
            await client.incrementEngagement(
              action.data.contentId,
              ContentEngagementType.LIKES,
            );
          }
        }
        break;
      }
      case EventActionType.UNLIKE: {
        const action = job.data as EventAction<PostActionData>;
        await Promise.all([
          client.markActionsDeleted(action.source.id),
          client.incrementEngagement(
            action.data.contentId,
            ContentEngagementType.LIKES,
            true,
          ),
        ]);
        break;
      }
      case EventActionType.REPOST: {
        const action = job.data as EventAction<PostActionData>;
        if (!(await client.findContent(action.data.contentId))) {
          await createPostContent(
            client,
            action.data.contentId,
            action.data.content,
          );
          if (created) {
            await client.incrementEngagement(
              action.data.contentId,
              ContentEngagementType.REPOSTS,
            );
          }
        }
        break;
      }
      case EventActionType.UNREPOST: {
        const action = job.data as EventAction<PostActionData>;
        await Promise.all([
          client.markActionsDeleted(action.source.id),
          client.incrementEngagement(
            action.data.contentId,
            ContentEngagementType.REPOSTS,
            true,
          ),
        ]);
        break;
      }
      case EventActionType.FOLLOW: {
        if (created) {
          const action = job.data as EventAction<EntityActionData>;
          const collection = client.getCollection<Entity>(
            MongoCollection.Entity,
          );

          const entityId = new ObjectId(action.data.entityId);
          const targetEntityId = new ObjectId(action.data.targetEntityId);

          await Promise.all([
            await collection.updateOne(
              {
                _id: entityId,
                "farcasterAccounts.id": action.data.sourceEntityId,
              },
              { $inc: { "farcasterAccounts.$.following": 1 } },
            ),
            await collection.updateOne(
              {
                _id: targetEntityId,
                "farcasterAccounts.id": action.data.sourceTargetEntityId,
              },
              { $inc: { "farcasterAccounts.$.followers": 1 } },
            ),
            handleFollowRelation(
              entityId.toString(),
              targetEntityId.toString(),
            ),
          ]);
        }
        break;
      }
      case EventActionType.UNFOLLOW: {
        const promises = [client.markActionsDeleted(job.data.source.id)];
        if (created) {
          const action = job.data as EventAction<EntityActionData>;
          const collection = client.getCollection<Entity>(
            MongoCollection.Entity,
          );

          const entityId = new ObjectId(action.data.entityId);
          const targetEntityId = new ObjectId(action.data.targetEntityId);

          promises.push(
            void collection.updateOne(
              {
                _id: new ObjectId(action.data.entityId),
                "farcasterAccounts.id": action.data.sourceEntityId,
              },
              { $inc: { "farcasterAccounts.$.following": 1 } },
            ),
          );
          promises.push(
            void collection.updateOne(
              {
                _id: new ObjectId(action.data.targetEntityId),
                "farcasterAccounts.id": action.data.sourceTargetEntityId,
              },
              { $inc: { "farcasterAccounts.$.followers": 1 } },
            ),
            handleFollowRelation(
              entityId.toString(),
              targetEntityId.toString(),
              true,
            ),
          );
        }
        await Promise.all(promises);
        break;
      }
      default:
        throw new Error(`[${job.data.type}] no handler found`);
    }

    console.log(
      `[${job.data.type}] processed ${job.data.source.id} by ${job.data.entityId}`,
    );
  };
};
