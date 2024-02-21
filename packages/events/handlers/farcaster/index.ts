import {
  EntityEventData,
  EventType,
  RawEvent,
  FarcasterCastData,
  FarcasterCastReactionData,
  FarcasterLinkData,
  FarcasterUrlReactionData,
  FarcasterUserDataAddData,
  FarcasterVerificationData,
} from "@nook/common/types";
import { MongoClient } from "@nook/common/mongo";
import { FarcasterProcessor } from "./processor";

export const handleFarcasterEvent = async (
  client: MongoClient,
  rawEvent: RawEvent<EntityEventData>,
) => {
  const processor = new FarcasterProcessor(client);
  switch (rawEvent.source.type) {
    case EventType.CAST_ADD:
    case EventType.CAST_REMOVE:
      return processor.processCastAddOrRemove(
        rawEvent as RawEvent<FarcasterCastData>,
      );
    case EventType.CAST_REACTION_ADD:
    case EventType.CAST_REACTION_REMOVE:
      return processor.processCastReactionAddOrRemove(
        rawEvent as RawEvent<FarcasterCastReactionData>,
      );
    case EventType.URL_REACTION_ADD:
    case EventType.URL_REACTION_REMOVE:
      return processor.processUrlReactionAddOrRemove(
        rawEvent as RawEvent<FarcasterUrlReactionData>,
      );
    case EventType.LINK_ADD:
    case EventType.LINK_REMOVE:
      return processor.processLinkAddOrRemove(
        rawEvent as RawEvent<FarcasterLinkData>,
      );
    case EventType.USER_DATA_ADD:
      return processor.processUserDataAdd(
        rawEvent as RawEvent<FarcasterUserDataAddData>,
      );
    case EventType.VERIFICATION_ADD:
    case EventType.VERIFICATION_REMOVE:
      return processor.processVerificationAddOrRemove(
        rawEvent as RawEvent<FarcasterVerificationData>,
      );
    default:
      throw new Error(
        `[${rawEvent.source.service}] [${rawEvent.source.type}] no handler found`,
      );
  }
};
