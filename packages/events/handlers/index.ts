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
  Entity,
  UpdateEntityInfoActionData,
  LinkBlockchainAddressActionData,
  EntityActionData,
  EntityInfoType,
  TipData,
  Content,
  ContentData,
  ContentActionData,
  PostData,
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
          content: Content<ContentData>[];
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
            response = await handleUserDataAdd(
              client,
              rawEvent as RawEvent<FarcasterUserDataAddData>,
            );
            break;
          case EventType.VERIFICATION_ADD_ETH_ADDRESS:
          case EventType.VERIFICATION_REMOVE:
            response = await handleVerificationAddOrRemove(
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

    // biome-ignore lint/suspicious/noExplicitAny: many different promises
    const promises: Promise<any>[] = [
      client.upsertEvent(response.event),
      ...response.actions.map((action) => client.upsertAction(action)),
    ];

    for (const action of response.actions) {
      switch (action.type) {
        case EventActionType.POST:
        case EventActionType.REPLY: {
          const typedAction = action as EventAction<ContentActionData>;
          const content = response.content.find(
            (c) => c.contentId === typedAction.data.contentId,
          );
          if (!content) {
            throw new Error(
              `Content not found for [${typedAction.data.contentId}]`,
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
          const content = response.content.find(
            (c) => c.contentId === typedAction.data.contentId,
          );
          if (!content) {
            throw new Error(
              `Content not found for [${typedAction.data.contentId}]`,
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
            client.incrementEngagement(
              typedAction.data.contentId,
              "likes",
              true,
            ),
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
        case EventActionType.UNFOLLOW: {
          const typedAction = action as EventAction<EntityActionData>;
          promises.push(
            client.markActionsDeleted(
              typedAction.source.id,
              EventActionType.FOLLOW,
            ),
          );
          break;
        }
        case EventActionType.UPDATE_USER_INFO: {
          const typedAction = action as EventAction<UpdateEntityInfoActionData>;
          const collection = client.getCollection<Entity>(
            MongoCollection.Entity,
          );
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
          const collection = client.getCollection<Entity>(
            MongoCollection.Entity,
          );
          promises.push(
            collection.updateOne(
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
                  updatedAt: new Date(),
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
            client.markActionsDeleted(
              typedAction.source.id,
              EventActionType.LINK_BLOCKCHAIN_ADDRESS,
            ),
            collection.updateOne(
              { _id: typedAction.data.entityId },
              {
                $pull: {
                  ethereum: { address: typedAction.data.address },
                },
                $set: { updatedAt: new Date() },
              },
            ),
          );
          break;
        }
        case EventActionType.TIP: {
          const typedAction = action as EventAction<TipData>;
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
          const typedAction = action as EventAction<TipData>;
          promises.push(
            client.markActionsDeleted(
              typedAction.source.id,
              EventActionType.TIP,
            ),
            client.incrementTip(
              typedAction.data.contentId,
              typedAction.data.targetContentId,
              typedAction.data.amount,
              true,
            ),
          );
          break;
        }
      }
    }

    await Promise.all(promises);

    console.log(
      `[${rawEvent.source.service}] [${rawEvent.source.type}] processed ${rawEvent.source.id} by ${rawEvent.source.entityId}`,
    );
  };
};
