import {
  ContentEngagementType,
  EventAction,
  EventActionData,
  EventActionType,
  PostActionData,
} from "@flink/common/types";
import { MongoClient } from "@flink/common/mongo";
import { createFarcasterContent } from "@flink/content/utils";
import { Job } from "bullmq";

export const getActionsHandler = async () => {
  const client = new MongoClient();
  await client.connect();

  return async (job: Job<EventAction<EventActionData>>) => {
    const created = await client.upsertAction(job.data);

    switch (job.data.type) {
      case EventActionType.POST: {
        const action = job.data as EventAction<PostActionData>;
        await createFarcasterContent(
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
          await createFarcasterContent(
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
          await createFarcasterContent(
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
          await createFarcasterContent(
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
      case EventActionType.FOLLOW:
        break;
      case EventActionType.UNFOLLOW: {
        await client.markActionsDeleted(job.data.source.id);
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
