import {
  EventAction,
  EventActionData,
  EventService,
  EventType,
  FarcasterCastData,
  FarcasterCastReactionData,
  FarcasterLinkData,
  FarcasterUrlReactionData,
  FarcasterUserDataAddData,
  FarcasterVerificationData,
  RawEvent,
  EntityEvent,
  EntityEventData,
  EventActionType,
  PostActionData,
  Entity,
  UpdateEntityInfoActionData,
  LinkBlockchainAddressActionData,
  EntityActionData,
} from "@flink/common/types";
import { MongoClient, MongoCollection } from "@flink/common/mongo";
import { Job } from "bullmq";
import { handleCastAddOrRemove } from "./farcaster/castAddOrRemove";
import { handleCastReactionAddOrRemove } from "./farcaster/castReactionAddOrRemove";
import { handleUrlReactionAddOrRemove } from "./farcaster/urlReactionAddOrRemove";
import { handleLinkAddOrRemove } from "./farcaster/linkAddOrRemove";
import { handleUserDataAdd } from "./farcaster/userDataAdd";
import { handleVerificationAddOrRemove } from "./farcaster/verificationAddOrRemove";

export const getEventsHandler = async () => {
  const client = new MongoClient();
  await client.connect();

  return async <T>(job: Job<RawEvent<T>>) => {
    const rawEvent = job.data;

    let response:
      | {
          event: EntityEvent<EntityEventData>;
          actions: EventAction<EventActionData>[];
        }
      | undefined;

    switch (rawEvent.source.service) {
      case EventService.FARCASTER:
        switch (rawEvent.source.type) {
          case EventType.CAST_ADD:
          case EventType.CAST_REMOVE:
            response = await handleCastAddOrRemove(
              client,
              rawEvent as RawEvent<FarcasterCastData>,
            );
            break;
          case EventType.CAST_REACTION_ADD:
          case EventType.CAST_REACTION_REMOVE:
            response = await handleCastReactionAddOrRemove(
              client,
              rawEvent as RawEvent<FarcasterCastReactionData>,
            );
            break;
          case EventType.URL_REACTION_ADD:
          case EventType.URL_REACTION_REMOVE:
            response = await handleUrlReactionAddOrRemove(
              client,
              rawEvent as RawEvent<FarcasterUrlReactionData>,
            );
            break;
          case EventType.LINK_ADD:
          case EventType.LINK_REMOVE:
            response = await handleLinkAddOrRemove(
              client,
              rawEvent as RawEvent<FarcasterLinkData>,
            );
            break;
          case EventType.USER_DATA_ADD:
            await handleUserDataAdd(
              client,
              rawEvent as RawEvent<FarcasterUserDataAddData>,
            );
            break;
          case EventType.VERIFICATION_ADD_ETH_ADDRESS:
          case EventType.VERIFICATION_REMOVE:
            await handleVerificationAddOrRemove(
              client,
              rawEvent as RawEvent<FarcasterVerificationData>,
            );
            break;
          default:
            throw new Error(
              `[${rawEvent.source.service}] [${rawEvent.source.type}] no handler found`,
            );
        }
        break;
      default:
        throw new Error(`[${rawEvent.source.service}] no handler found`);
    }

    if (!response) return;

    const promises = [
      void client.upsertEvent(response.event),
      ...response.actions.map((action) => void client.upsertAction(action)),
    ];

    for (const action of response.actions) {
      switch (action.type) {
        case EventActionType.POST:
        case EventActionType.REPLY: {
          const typedAction = action as EventAction<PostActionData>;
          promises.push(
            ...typedAction.data.content.embeds.map(
              (contentId) =>
                void client.incrementEngagement(contentId, "embeds"),
            ),
          );
          if (typedAction.data.content.parentId) {
            promises.push(
              void client.incrementEngagement(
                typedAction.data.content.parentId,
                "replies",
              ),
            );
          }
          break;
        }
        case EventActionType.UNPOST:
        case EventActionType.UNREPLY: {
          const typedAction = action as EventAction<PostActionData>;
          promises.push(
            void client.markActionsDeleted(typedAction.source.id),
            void client.markContentDeleted(typedAction.data.contentId),
            ...typedAction.data.content.embeds.map(
              (contentId) =>
                void client.incrementEngagement(contentId, "embeds", true),
            ),
          );
          if (typedAction.data.content.parentId) {
            promises.push(
              void client.incrementEngagement(
                typedAction.data.content.parentId,
                "replies",
                true,
              ),
            );
          }
          break;
        }
        case EventActionType.LIKE: {
          const typedAction = action as EventAction<PostActionData>;
          promises.push(
            void client.incrementEngagement(
              typedAction.data.contentId,
              "likes",
            ),
          );
          break;
        }
        case EventActionType.REPOST: {
          const typedAction = action as EventAction<PostActionData>;
          promises.push(
            void client.incrementEngagement(
              typedAction.data.contentId,
              "reposts",
            ),
          );
          break;
        }
        case EventActionType.UNLIKE: {
          const typedAction = action as EventAction<PostActionData>;
          promises.push(
            void client.markActionsDeleted(typedAction.source.id),
            void client.incrementEngagement(
              typedAction.data.contentId,
              "likes",
              true,
            ),
          );
          break;
        }
        case EventActionType.UNREPOST: {
          const typedAction = action as EventAction<PostActionData>;
          promises.push(
            void client.markActionsDeleted(typedAction.source.id),
            void client.incrementEngagement(
              typedAction.data.contentId,
              "reposts",
              true,
            ),
          );
          break;
        }
        case EventActionType.UNFOLLOW: {
          const typedAction = action as EventAction<EntityActionData>;
          promises.push(void client.markActionsDeleted(typedAction.source.id));
          break;
        }
        case EventActionType.UPDATE_USER_INFO: {
          const typedAction = action as EventAction<UpdateEntityInfoActionData>;
          const collection = client.getCollection<Entity>(
            MongoCollection.Entity,
          );
          promises.push(
            void collection.updateOne(
              {
                _id: action.data.entityId,
                "farcaster.fid": typedAction.data.sourceEntityId,
              },
              {
                $set: {
                  [`farcaster.${typedAction.data.entityDataType}`]:
                    typedAction.data.entityData,
                },
              },
            ),
          );
          break;
        }
        case EventActionType.LINK_BLOCKCHAIN_ADDRESS: {
          const typedAction =
            action as EventAction<LinkBlockchainAddressActionData>;
          const collection = client.getCollection<Entity>(
            MongoCollection.Entity,
          );
          promises.push(
            void collection.updateOne(
              {
                _id: typedAction.data.entityId,
                "ethereum.$.address": typedAction.data.address,
              },
              {
                $set: {
                  "ethereum.$": {
                    address: typedAction.data.address,
                    isContract: typedAction.data.isContract,
                  },
                },
              },
              {
                upsert: true,
              },
            ),
          );
          break;
        }
        case EventActionType.UNLINK_BLOCKCHAIN_ADDRESS: {
          const typedAction =
            action as EventAction<LinkBlockchainAddressActionData>;
          const collection = client.getCollection<Entity>(
            MongoCollection.Entity,
          );
          promises.push(
            void collection.updateOne(
              { _id: typedAction.data.entityId },
              { $pull: { ethereum: { address: typedAction.data.address } } },
            ),
          );
        }
      }
    }

    await Promise.all(promises);

    console.log(
      `[${rawEvent.source.service}] [${rawEvent.source.type}] processed ${rawEvent.source.id} by ${rawEvent.source.entityId}`,
    );
  };
};
