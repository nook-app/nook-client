import { MongoClient } from "@flink/common/mongo";
import { Job } from "bullmq";
import { getOrCreateUrlContent } from "./url";

export const getContentHandler = async () => {
  const client = new MongoClient();
  await client.connect();

  return async (job: Job<{ contentId: string }>) => {
    if (
      job.data.contentId.startsWith("http://") ||
      job.data.contentId.startsWith("https://")
    ) {
      await getOrCreateUrlContent(client, job.data.contentId);
    }

    console.log(`processed ${job.data.contentId}`);
  };
};
