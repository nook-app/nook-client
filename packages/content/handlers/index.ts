import { MongoClient } from "@flink/common/mongo";
import { Job } from "bullmq";

export const getContentHandler = async () => {
  const client = new MongoClient();
  await client.connect();

  return async (job: Job<{ contentId: string }>) => {
    const content = await client.findContent(job.data.contentId);
    if (!content) {
      if (job.data.contentId.startsWith("farcaster://")) {
      } else {
      }
    }

    console.log(`processed ${job.data.contentId}`);
  };
};
