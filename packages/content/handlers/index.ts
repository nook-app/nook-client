import { MongoClient } from "@flink/common/mongo";
import { Job } from "bullmq";
import { getOrCreateUrlContent } from "./url";

export const getContentHandler = async () => {
  const client = new MongoClient();
  await client.connect();

  return async (job: Job<{ contentId: string }>) => {
    const content = await client.findContent(job.data.contentId);
    if (!content) {
      if (
        job.data.contentId.startsWith("http://") ||
        job.data.contentId.startsWith("https://")
      ) {
        await getOrCreateUrlContent(client, job.data.contentId);
      }
    }

    console.log(`processed ${job.data.contentId}`);
  };
};
