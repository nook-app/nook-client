import {
  EventAction,
  EventActionType,
  Entity,
  PostActionData,
  EventActionRequest,
  UpdateEntityInfoActionData,
  LinkBlockchainAddressActionData,
} from "@flink/common/types";
import { MongoClient, MongoCollection } from "@flink/common/mongo";
import { Job } from "bullmq";
import { handlePostRelatedAction } from "./post";

export const getActionsHandler = async () => {
  const client = new MongoClient();
  await client.connect();

  return async (job: Job<EventActionRequest>) => {
    const data = await client.findAction(job.data.actionId);

    if (data == null) {
      throw new Error(`[${job.data.actionId}] not found`);
    }

    switch (data.type) {
      case EventActionType.POST:
      case EventActionType.REPLY:
      case EventActionType.LIKE:
      case EventActionType.REPOST: {
        await handlePostRelatedAction(
          client,
          data as EventAction<PostActionData>,
        );
        break;
      }
      case EventActionType.UNPOST:
      case EventActionType.UNREPLY: {
        const action = data as EventAction<PostActionData>;
        await Promise.all([
          client.markActionsDeleted(action.source.id),
          client.markContentDeleted(action.data.contentId),
        ]);
        break;
      }
      case EventActionType.UNLIKE:
      case EventActionType.UNREPOST: {
        const action = data as EventAction<PostActionData>;
        await client.markActionsDeleted(action.source.id);
        break;
      }
      case EventActionType.FOLLOW: {
        break;
      }
      case EventActionType.UNFOLLOW: {
        /* biome-ignore lint/suspicious/noExplicitAny: promises don't matter but void keyword returns undefined*/
        const promises: Promise<any>[] = [
          client.markActionsDeleted(data.source.id),
        ];
        await Promise.all(promises);
        break;
      }
      case EventActionType.UPDATE_USER_INFO: {
        const action = data as EventAction<UpdateEntityInfoActionData>;
        const collection = client.getCollection<Entity>(MongoCollection.Entity);
        await collection.updateOne(
          {
            _id: action.data.entityId,
            "farcaster.fid": action.data.sourceEntityId,
          },
          {
            $set: {
              [`farcaster.${action.data.entityDataType}`]:
                action.data.entityData,
            },
          },
        );
        break;
      }
      case EventActionType.LINK_BLOCKCHAIN_ADDRESS: {
        const action = data as EventAction<LinkBlockchainAddressActionData>;
        const collection = client.getCollection<Entity>(MongoCollection.Entity);
        await collection.updateOne(
          {
            _id: action.data.entityId,
            "ethereum.$.address": action.data.address,
          },
          {
            $set: {
              "ethereum.$": {
                address: action.data.address,
                isContract: action.data.isContract,
                // TOOD: get ens name
              },
            },
          },
          {
            upsert: true,
          },
        );
        break;
      }
      case EventActionType.UNLINK_BLOCKCHAIN_ADDRESS: {
        const action = data as EventAction<LinkBlockchainAddressActionData>;
        const collection = client.getCollection<Entity>(MongoCollection.Entity);
        await collection.updateOne(
          { _id: action.data.entityId },
          { $pull: { ethereum: { address: action.data.address } } },
        );
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
