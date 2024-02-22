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
  EntityUsernameData,
  UsernameType,
} from "@nook/common/types";
import { MongoClient, MongoCollection } from "@nook/common/mongo";
import { Job } from "bullmq";
import { ObjectId } from "mongodb";

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
      // TODO: Update nook metadata
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
              _id: new ObjectId(action.data.entityId),
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

        if (typedAction.data.entityDataType === EntityInfoType.USERNAME) {
          promises.push(
            collection.updateOne(
              {
                _id: new ObjectId(typedAction.data.entityId),
                "farcaster.fid": typedAction.data.sourceEntityId,
              },
              {
                $addToSet: {
                  usernames: {
                    type: typedAction.data.entityData.endsWith(".eth")
                      ? UsernameType.ENS
                      : UsernameType.FNAME,
                    username: typedAction.data.entityData,
                  },
                },
                $set: {
                  updatedAt: new Date(),
                },
              },
            ),
          );
        }
        break;
      }
      case EventActionType.ADD_USERNAME: {
        const typedAction = action as EventAction<EntityUsernameData>;
        const collection = client.getCollection<Entity>(MongoCollection.Entity);
        promises.push(
          collection.updateOne(
            {
              _id: new ObjectId(typedAction.data.entityId),
              "farcaster.fid": typedAction.data.sourceEntityId,
            },
            {
              $addToSet: {
                usernames: {
                  type: typedAction.data.usernameType,
                  username: typedAction.data.username,
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
      case EventActionType.LINK_BLOCKCHAIN_ADDRESS: {
        const typedAction =
          action as EventAction<LinkBlockchainAddressActionData>;
        const collection = client.getCollection<Entity>(MongoCollection.Entity);
        promises.push(
          collection.updateOne(
            { _id: new ObjectId(typedAction.data.entityId) },
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
            { _id: new ObjectId(typedAction.data.entityId) },
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
      case EventActionType.FOLLOW: {
        const typedAction = action as EventAction<EntityActionData>;
        const collection = client.getCollection<Entity>(MongoCollection.Entity);
        promises.push(
          collection.updateOne(
            {
              _id: new ObjectId(typedAction.data.entityId),
            },
            {
              $inc: {
                "farcaster.following": 1,
              },
            },
          ),
          collection.updateOne(
            {
              _id: new ObjectId(typedAction.data.targetEntityId),
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
              _id: new ObjectId(typedAction.data.entityId),
            },
            {
              $inc: {
                "farcaster.following": -1,
              },
            },
          ),
          collection.updateOne(
            {
              _id: new ObjectId(typedAction.data.targetEntityId),
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
