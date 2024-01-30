import {
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
        if (action.data.content) {
          await insertPostContent(
            client,
            action.data.contentId,
            action.data.content,
          );
        }
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
        if (action.data.content) {
          await insertPostContent(
            client,
            action.data.contentId,
            action.data.content,
          );
        }
        break;
      }
      case EventActionType.UNREPLY: {
        const action = data as EventAction<PostActionData>;
        const promises = [
          client.markActionsDeleted(action.source.id),
          client.markContentDeleted(action.data.contentId),
        ];
        await Promise.all(promises);
        break;
      }
      case EventActionType.LIKE: {
        const action = data as EventAction<PostActionData>;
        if (action.data.content) {
          await insertPostContent(
            client,
            action.data.contentId,
            action.data.content,
          );
        }
        break;
      }
      case EventActionType.UNLIKE: {
        const action = data as EventAction<PostActionData>;
        const promises = [client.markActionsDeleted(action.source.id)];
        await Promise.all(promises);
        break;
      }
      case EventActionType.REPOST: {
        const action = data as EventAction<PostActionData>;
        if (action.data.content) {
          await insertPostContent(
            client,
            action.data.contentId,
            action.data.content,
          );
        }
        break;
      }
      case EventActionType.UNREPOST: {
        const action = data as EventAction<PostActionData>;
        const promises = [client.markActionsDeleted(action.source.id)];
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
