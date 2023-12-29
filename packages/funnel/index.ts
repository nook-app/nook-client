import { QueueName, getWorker } from "@flink/common/queue";
import { Job } from "bullmq";
import { MongoClient } from "mongodb";
import { Event, EventSource, PreprocessedEvent } from "@flink/common/types";

const client = new MongoClient(process.env.EVENT_DATABASE_URL);

const run = async () => {
  await client.connect();
  const db = client.db("flink");
  const collection = db.collection("events");

  const worker = getWorker(QueueName.Funnel, async (job: Job) => {
    const preprocessedEvent: PreprocessedEvent = job.data;

    let userId: string | undefined;
    let identityMapping = {};

    if (preprocessedEvent.source === EventSource.FARCASTER) {
      const sourceUserIds = [
        preprocessedEvent.data.fid,
        preprocessedEvent.data.parentFid,
        preprocessedEvent.data.rootParentFid,
      ].filter(Boolean);

      const userIds = await Promise.all(
        sourceUserIds.map(async (sourceUserId) => {
          const res = await fetch(
            `${process.env.IDENTITY_SERVICE_URL}/identity/by-fid/${sourceUserId}`,
          );
          if (!res.ok) {
            console.log(
              `[funnel] error fetching identity for fid ${sourceUserId}`,
            );
            return;
          }
          const { id }: { id: string } = await res.json();
          return { [sourceUserId]: id };
        }),
      );

      identityMapping = userIds.reduce((acc, curr) => {
        if (!curr) {
          return acc;
        }
        // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
        return { ...acc, ...curr };
      }, {});
      userId = identityMapping[preprocessedEvent.data.fid];
    }

    if (!userId) {
      throw new Error("Missing userId");
    }

    const event: Event = {
      ...preprocessedEvent,
      userId,
      identityMapping,
    };

    await collection.insertOne(event);

    console.log(`[funnel] processed event ${job.id}`);
  });

  worker.on("failed", (job, err) => {
    if (job) {
      console.log(`[funnel] [${job.id}] failed with ${err.message}`);
    }
  });
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
