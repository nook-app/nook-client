import {
  Content,
  ContentActionData,
  EventAction,
  EventActionType,
  PostData,
  TipActionData,
  Topic,
  TopicType,
} from "@nook/common/types";
import { DEGEN_ASSET_ID } from "@nook/common/constants";
import { MongoClient } from "@nook/common/mongo";

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

  const fid = entity.farcaster.fid;
  if (!fid) {
    throw new Error(`FID not found for ${content.data.entityId}`);
  }

  const { tipAllowance, tipUsage } = await getTipAllowanceAndUsage(
    fid,
    rawTips,
  );

  if (tipAllowance < tipUsage) {
    console.log(
      `Insufficient tip allowance: ${tipAllowance} < ${tipUsage} for ${fid} `,
    );
    return [];
  }

  return rawTips.map((tip) => {
    const topics: Topic[] = [
      {
        type: TopicType.TIP_ASSET,
        value: DEGEN_ASSET_ID,
      },
      {
        type: TopicType.TIP_SOURCE,
        value: tip.sourceContentId,
      },
      {
        type: TopicType.TIP_TARGET,
        value: tip.targetContentId,
      },
      {
        type: TopicType.TIP_SOURCE_ENTITY,
        value: tip.entityId.toString(),
      },
      {
        type: TopicType.TIP_TARGET_ENTITY,
        value: tip.targetEntityId.toString(),
      },
    ];

    if (content.data.channelId) {
      topics.push({
        type: TopicType.CHANNEL,
        value: content.data.channelId,
      });
    }

    return {
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
      topics,
    };
  });
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

const getTipAllowanceAndUsage = async (fid: string, tips: TipActionData[]) => {
  const results = await fetch(
    `https://www.degen.tips/api/airdrop2/tip-allowance?fid=${fid}`,
  ).then((res) => res.json());

  const allowances: number[] = results.map((data: { tip_allowance: string }) =>
    parseInt(data.tip_allowance, 10),
  );

  const tipAllowance = allowances.reduce((acc, curr) => acc + curr, 0);
  const tipUsage = tips.reduce((acc, tip) => acc + tip.amount, 0);

  return {
    tipAllowance,
    tipUsage,
  };
};
