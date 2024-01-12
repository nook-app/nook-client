import { ContentRequest } from "@flink/common/types";
import { MongoClient } from "@flink/common/mongo";
import { Job } from "bullmq";
import { handleFarcasterContent } from "./farcaster";
import { handleUrlContent } from "./url";

export const getContentHandler = async () => {
  const client = new MongoClient();
  await client.connect();

  return async (job: Job<ContentRequest>) => {
    if (job.data.contentId.startsWith("farcaster://cast/")) {
      await handleFarcasterContent(client, job.data.contentId);
      console.log(`[${job.data.contentId}] processed`);
    } else {
      await handleUrlContent(client, job.data);
    }
    console.log(`processed ${job.data.contentId}`);
  };
};
