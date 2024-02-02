import { MongoClient } from "@flink/common/mongo";
import { EventAction, PostActionData } from "@flink/common/types";
import { getOrCreatePostContent } from "../content/post";
import { getOrCreateUrlContent } from "../content/url";

export const handlePostRelatedAction = async (
  client: MongoClient,
  action: EventAction<PostActionData>,
) => {
  await Promise.all([
    getOrCreatePostContent(client, action.data.content),
    ...action.data.content.embeds.map((embed) =>
      getOrCreateUrlContent(client, {
        contentId: embed,
        submitterId: action.data.content.entityId,
        timestamp: action.data.content.timestamp,
      }),
    ),
  ]);
};
