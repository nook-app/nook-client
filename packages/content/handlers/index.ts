import { MongoClient } from "@nook/common/mongo";
import { Job } from "bullmq";
import { getOrCreateContent } from "@nook/common/scraper";

export const getContentHandler = async () => {
  const client = new MongoClient();
  await client.connect();

  return async (job: Job<{ contentId: string }>) => {
    if (!(await getOrCreateContent(client, job.data.contentId))) {
      throw new Error(
        `failed to get or create content for ${job.data.contentId}`,
      );
    }
    console.log(`processed ${job.data.contentId}`);
  };
};
