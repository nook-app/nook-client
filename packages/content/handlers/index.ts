import { MongoClient } from "@nook/common/mongo";
import { Job } from "bullmq";
import { getOrCreateContent } from "@nook/common/scraper";

export const getContentHandler = async () => {
  const client = new MongoClient();
  await client.connect();

  return async (job: Job<{ contentId: string; channel?: boolean }>) => {
    await getOrCreateContent(client, job.data.contentId, job.data.channel);
    console.log(`processed ${job.data.contentId}`);
  };
};
