import { QueueName, getWorker } from "@flink/common/queues";
import { MongoClient } from "mongodb";
import { ContentBase } from "@flink/common/types";
import { Job } from "bullmq";

const client = new MongoClient(process.env.EVENT_DATABASE_URL);

export const getContentHandler = async () => {
  await client.connect();
  const db = client.db("flink");
  const contentCollection = db.collection("content");

  return async (job: Job<ContentBase>) => {
    const content = job.data;

    await contentCollection.findOneAndUpdate(
      {
        contentId: content.contentId,
      },
      { $set: content },
      {
        upsert: true,
      },
    );

    console.log(`[content] processed ${content.contentId}`);
  };
};

const run = async () => {
  const handler = await getContentHandler();
  const worker = getWorker(QueueName.ContentIngress, handler);

  worker.on("failed", (job, err) => {
    if (job) {
      console.log(`[events] [${job.id}] failed with ${err.message}`);
    }
  });
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
