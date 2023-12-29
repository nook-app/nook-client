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

    let sourceUserId: string | undefined;
    let preprocessedUserIds: string[] | undefined;

    if (preprocessedEvent.source === EventSource.FARCASTER) {
      preprocessedUserIds = [
        preprocessedEvent.data.fid,
        preprocessedEvent.data.parentFid,
        preprocessedEvent.data.rootParentFid,
        ...preprocessedEvent.data.mentions.map((mention) => mention.mention),
        ...preprocessedEvent.data.castEmbeds.map((embed) => embed.fid),
      ].filter(Boolean);
      sourceUserId = preprocessedEvent.data.fid;
    }

    const userIds = await Promise.all(
      preprocessedUserIds.map(async (userId) => {
        const res = await fetch(
          `${process.env.IDENTITY_SERVICE_URL}/identity/by-fid/${userId}`,
        );
        if (!res.ok) {
          console.log(`[funnel] error fetching identity for fid ${userId}`);
          return;
        }
        const { id }: { id: string } = await res.json();
        return { [userId]: id };
      }),
    );

    const identityMapping = userIds.reduce((acc, curr) => {
      if (!curr) {
        return acc;
      }
      // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
      return { ...acc, ...curr };
    }, {});

    const userId = identityMapping[sourceUserId];
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
