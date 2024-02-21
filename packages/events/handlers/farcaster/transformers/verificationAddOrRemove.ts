import {
  Protocol,
  EntityEvent,
  EventAction,
  EventActionType,
  EventType,
  FarcasterVerificationData,
  LinkBlockchainAddressActionData,
  RawEvent,
  TopicType,
  Entity,
} from "@nook/common/types";

export const transformVerificationAddOrRemove = async (
  rawEvent: RawEvent<FarcasterVerificationData>,
  entities: Record<string, Entity>,
) => {
  const isRemove = rawEvent.source.type === EventType.VERIFICATION_REMOVE;
  const entityId = entities[rawEvent.data.fid]._id;
  const action: EventAction<LinkBlockchainAddressActionData> = {
    eventId: rawEvent.eventId,
    source: rawEvent.source,
    timestamp: new Date(rawEvent.timestamp),
    entityId,
    referencedEntityIds: [entityId],
    referencedContentIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    type: isRemove
      ? EventActionType.UNLINK_BLOCKCHAIN_ADDRESS
      : EventActionType.LINK_BLOCKCHAIN_ADDRESS,
    data: {
      sourceEntityId: rawEvent.data.fid,
      entityId,
      address: rawEvent.data.address.toLowerCase(),
      isContract: rawEvent.data.verificationType === 1,
      protocol:
        rawEvent.data.protocol === 0 ? Protocol.ETHEREUM : Protocol.SOLANA,
      chainId: rawEvent.data.chainId,
      claimSignature: rawEvent.data.claimSignature,
      blockHash: rawEvent.data.blockHash,
    },
    deletedAt: isRemove ? new Date() : undefined,
    topics: [
      {
        type: TopicType.SOURCE_ENTITY,
        value: entityId.toString(),
      },
    ],
  };

  const event: EntityEvent<FarcasterVerificationData> = {
    ...rawEvent,
    entityId,
    timestamp: new Date(rawEvent.timestamp),
    createdAt: action.createdAt,
    updatedAt: action.updatedAt,
  };

  return {
    event,
    actions: [action],
    content: [],
  };
};
