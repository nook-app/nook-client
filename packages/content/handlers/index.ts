import { ContentRequest } from "@flink/common/types";
import { MongoClient } from "@flink/common/mongo";
import { Job } from "bullmq";
import { getOrCreateFarcasterPostOrReplyByContentId } from "./farcaster";

export const getContentHandler = async () => {
  const client = new MongoClient();
  await client.connect();

  return async (job: Job<ContentRequest>) => {
    if (job.data.contentId.startsWith("farcaster://cast/")) {
      await getOrCreateFarcasterPostOrReplyByContentId(
        client,
        job.data.contentId,
      );
      console.log(`[content] [${job.data.contentId}] processed`);
      return;
    }
  };
};
