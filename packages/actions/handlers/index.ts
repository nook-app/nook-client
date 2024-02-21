import {
  EventAction,
  EventActionType,
  Entity,
  UpdateEntityInfoActionData,
  LinkBlockchainAddressActionData,
  EntityActionData,
  EntityInfoType,
  Content,
  ContentActionData,
  PostData,
  TipActionData,
} from "@nook/common/types";
import { MongoClient, MongoCollection } from "@nook/common/mongo";
import { Job } from "bullmq";
import { handleTips } from "./tips";

export const getActionsHandler = async () => {
  const client = new MongoClient();
  await client.connect();

  return async <T>(job: Job<{ actionId: string; created: boolean }>) => {
    // If the action was not created, we don't need to process it again
    if (!job.data.created) return;

    const action = await client.findAction(job.data.actionId);
    if (!action) {
      throw new Error(`Action not found for ${job.data.actionId}`);
    }

    const promises = [];

    switch (action.type) {
      case EventActionType.POST:
      case EventActionType.REPLY: {
        const typedAction = action as EventAction<ContentActionData>;
        const content = await client.findContent(typedAction.data.contentId);
        if (!content) {
          throw new Error(
            `Content not found for ${typedAction.data.contentId}`,
          );
        }
        const typedContent = content as Content<PostData>;
        promises.push(
          ...typedContent.data.embeds.map((contentId) =>
            client.incrementEngagement(contentId, "embeds"),
          ),
        );
        if (typedContent.data.parentId) {
          promises.push(
            client.incrementEngagement(typedContent.data.parentId, "replies"),
          );
          const tipActions = await handleTips(
            client,
            typedAction,
            typedContent,
          );
          promises.push(...tipActions.map((a) => client.upsertAction(a)));
        }
        break;
      }
      case EventActionType.UNPOST:
      case EventActionType.UNREPLY: {
        const typedAction = action as EventAction<ContentActionData>;
        const content = await client.findContent(typedAction.data.contentId);
        if (!content) {
          throw new Error(
            `Content not found for ${typedAction.data.contentId}`,
          );
        }
        const typedContent = content as Content<PostData>;
        promises.push(
          client.markActionsDeleted(
            typedAction.source.id,
            typedAction.type === EventActionType.UNPOST
              ? EventActionType.POST
              : EventActionType.REPLY,
          ),
          client.markContentDeleted(typedAction.data.contentId),
          ...typedContent.data.embeds.map((contentId) =>
            client.incrementEngagement(contentId, "embeds", true),
          ),
        );
        if (typedContent.data.parentId) {
          promises.push(
            client.incrementEngagement(
              typedContent.data.parentId,
              "replies",
              true,
            ),
          );
          const tipActions = await handleTips(
            client,
            typedAction,
            typedContent,
            true,
          );
          promises.push(...tipActions.map((a) => client.upsertAction(a)));
        }
        break;
      }
      case EventActionType.LIKE: {
        const typedAction = action as EventAction<ContentActionData>;
        promises.push(
          client.incrementEngagement(typedAction.data.contentId, "likes"),
        );
        break;
      }
      case EventActionType.REPOST: {
        const typedAction = action as EventAction<ContentActionData>;
        promises.push(
          client.incrementEngagement(typedAction.data.contentId, "reposts"),
        );
        break;
      }
      case EventActionType.UNLIKE: {
        const typedAction = action as EventAction<ContentActionData>;
        promises.push(
          client.markActionsDeleted(
            typedAction.source.id,
            EventActionType.LIKE,
          ),
          client.incrementEngagement(typedAction.data.contentId, "likes", true),
        );
        break;
      }
      case EventActionType.UNREPOST: {
        const typedAction = action as EventAction<ContentActionData>;
        promises.push(
          client.markActionsDeleted(
            typedAction.source.id,
            EventActionType.REPOST,
          ),
          client.incrementEngagement(
            typedAction.data.contentId,
            "reposts",
            true,
          ),
        );
        break;
      }
      case EventActionType.UPDATE_USER_INFO: {
        const typedAction = action as EventAction<UpdateEntityInfoActionData>;
        const collection = client.getCollection<Entity>(MongoCollection.Entity);
        let field;
        switch (typedAction.data.entityDataType) {
          case EntityInfoType.USERNAME:
            field = "farcaster.username";
            break;
          case EntityInfoType.PFP:
            field = "farcaster.pfp";
            break;
          case EntityInfoType.DISPLAY:
            field = "farcaster.displayName";
            break;
          case EntityInfoType.BIO:
            field = "farcaster.bio";
            break;
          case EntityInfoType.URL:
            field = "farcaster.url";
            break;
          default:
            throw new Error(
              `[${typedAction.data.entityDataType}] not a valid entity data type`,
            );
        }

        promises.push(
          collection.updateOne(
            {
              _id: action.data.entityId,
              "farcaster.fid": typedAction.data.sourceEntityId,
            },
            {
              $set: {
                [field]: typedAction.data.entityData,

                updatedAt: new Date(),
              },
            },
          ),
        );
        break;
      }
      case EventActionType.LINK_BLOCKCHAIN_ADDRESS: {
        const typedAction =
          action as EventAction<LinkBlockchainAddressActionData>;
        const collection = client.getCollection<Entity>(MongoCollection.Entity);
        promises.push(
          collection.updateOne(
            { _id: typedAction.data.entityId },
            {
              $addToSet: {
                blockchain: {
                  protocol: typedAction.data.protocol,
                  address: typedAction.data.address,
                  isContract: typedAction.data.isContract,
                },
              },
              $set: {
                updatedAt: new Date(),
              },
            },
          ),
        );
        break;
      }
      case EventActionType.UNLINK_BLOCKCHAIN_ADDRESS: {
        const typedAction =
          action as EventAction<LinkBlockchainAddressActionData>;
        const collection = client.getCollection<Entity>(MongoCollection.Entity);
        promises.push(
          client.markActionsDeleted(
            typedAction.source.id,
            EventActionType.LINK_BLOCKCHAIN_ADDRESS,
          ),
          collection.updateOne(
            { _id: typedAction.data.entityId },
            {
              $pull: {
                blockchain: { address: typedAction.data.address },
              },
              $set: { updatedAt: new Date() },
            },
          ),
        );
        break;
      }
      case EventActionType.TIP: {
        const typedAction = action as EventAction<TipActionData>;
        promises.push(
          client.incrementTip(
            typedAction.data.contentId,
            typedAction.data.targetContentId,
            typedAction.data.amount,
          ),
        );
        break;
      }
      case EventActionType.UNTIP: {
        const typedAction = action as EventAction<TipActionData>;
        promises.push(
          client.incrementTip(
            typedAction.data.contentId,
            typedAction.data.targetContentId,
            typedAction.data.amount,
            true,
          ),
          client.markActionsDeleted(typedAction.source.id, EventActionType.TIP),
        );
        break;
      }
      case EventActionType.FOLLOW: {
        const typedAction = action as EventAction<EntityActionData>;
        const collection = client.getCollection<Entity>(MongoCollection.Entity);
        promises.push(
          collection.updateOne(
            {
              _id: typedAction.data.entityId,
            },
            {
              $inc: {
                "farcaster.following": 1,
              },
            },
          ),
          collection.updateOne(
            {
              _id: typedAction.data.targetEntityId,
            },
            {
              $inc: {
                "farcaster.followers": 1,
              },
            },
          ),
        );
        break;
      }
      case EventActionType.UNFOLLOW: {
        const typedAction = action as EventAction<EntityActionData>;
        const collection = client.getCollection<Entity>(MongoCollection.Entity);
        promises.push(
          client.markActionsDeleted(
            typedAction.source.id,
            EventActionType.FOLLOW,
          ),
          collection.updateOne(
            {
              _id: typedAction.data.entityId,
            },
            {
              $inc: {
                "farcaster.following": -1,
              },
            },
          ),
          collection.updateOne(
            {
              _id: typedAction.data.targetEntityId,
            },
            {
              $inc: {
                "farcaster.followers": -1,
              },
            },
          ),
        );
        break;
      }
    }

    await Promise.all(promises);

    console.log(
      `[${action.eventId}] ${action.type} action ${action._id} processed`,
    );
  };
};
