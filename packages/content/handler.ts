import { MongoClient } from "mongodb";
import { Content, ContentRequest } from "@flink/common/types";
import { Job } from "bullmq";
import { getAndTransformCastAddToContent } from "./handlers/farcaster";

const client = new MongoClient(process.env.EVENT_DATABASE_URL);

export const getContentHandler = async () => {
  await client.connect();
  const db = client.db("flink");
  const contentCollection = db.collection("content");

  return async (job: Job<ContentRequest>) => {
    console.log(`[content] processing ${job.data.contentId}`);

    if (
      await contentCollection.findOne({
        contentId: job.data.contentId,
      })
    ) {
      console.log(`[content] already processed ${job.data.contentId}`);
      return;
    }

    let content: Content | undefined;

    if (job.data.contentId.startsWith("farcaster://cast/")) {
      content = await getAndTransformCastAddToContent(job.data.contentId);
    } else {
      console.log(
        `[content] not processing url content right now ${job.data.contentId}`,
      );
      return;
    }

    if (!content) {
      throw new Error(`[content] unknown content type ${job.data.contentId}`);
    }

    await contentCollection.deleteOne({
      contentId: content.contentId,
    });
    await contentCollection.insertOne(content);

    console.log(`[content] processed ${content.contentId}`);
  };
};
