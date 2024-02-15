import {
  Content,
  ContentActionData,
  EventAction,
  EventActionType,
  PostData,
  Protocol,
  TipActionData,
} from "@flink/common/types";
import { DEGEN_ASSET_ID } from "@flink/common/constants";
import { MongoClient } from "@flink/common/mongo";

export const handleTips = async (
  client: MongoClient,
  action: EventAction<ContentActionData>,
  content: Content<PostData>,
  isUntip = false,
) => {
  const rawTips = extractTips(content.data);
  if (rawTips.length === 0) return [];

  const entity = await client.findEntity(content.data.entityId);
  if (!entity) {
    throw new Error(`Entity not found for ${content.data.entityId}`);
  }

  const addresses =
    entity.blockchain?.filter((b) => b.protocol === Protocol.ETHEREUM) || [];
  if (addresses.length === 0) {
    throw new Error(`No Ethereum addresses found for entity ${entity._id}`);
  }

  if (
    !(await validateAllowance(
      addresses.map((a) => a.address),
      rawTips,
    ))
  ) {
    throw new Error("Insufficient tip allowance");
  }

  return rawTips.map((tip) => ({
    eventId: action.eventId,
    source: action.source,
    timestamp: content.timestamp,
    entityId: content.data.entityId,
    referencedEntityIds: content.referencedEntityIds,
    referencedContentIds: content.referencedContentIds,
    createdAt: new Date(),
    updatedAt: new Date(),
    type: isUntip ? EventActionType.UNTIP : EventActionType.TIP,
    data: tip,
    topics: content.topics,
  }));
};

const extractTips = ({
  contentId,
  entityId,
  parentId,
  parentEntityId,
  text,
}: PostData): TipActionData[] => {
  if (!parentId || !parentEntityId) return [];
  if (parentEntityId.equals(entityId)) return [];
  const degenTipPattern = /(\d+)\s+\$DEGEN/gi;
  const matches = [...text.matchAll(degenTipPattern)];
  return matches.map((match) => ({
    entityId,
    targetEntityId: parentEntityId,
    contentId: DEGEN_ASSET_ID.toLowerCase(),
    amount: parseInt(match[1], 10),
    sourceContentId: contentId,
    targetContentId: parentId,
  }));
};

const validateAllowance = async (
  addresses: string[],
  tips: TipActionData[],
): Promise<boolean> => {
  const responses = await Promise.all(
    addresses.map(async (address) => {
      const { tip_allowance } = await fetch(
        `https://www.degen.tips/api/airdrop2/tip-allowance?address=${address}`,
      ).then((res) => res.json());
      return tip_allowance;
    }),
  );

  const totalAllowance = responses.reduce((acc, curr) => acc + curr, 0);
  const totalTips = tips.reduce((acc, tip) => acc + tip.amount, 0);
  return totalTips <= totalAllowance;
};
