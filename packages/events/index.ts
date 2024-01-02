import { QueueName, getWorker } from "@flink/common/queues";
import { MongoClient } from "mongodb";
import { Event, EventAction, EventSource } from "@flink/common/types";
import { handleFarcasterCastAdd } from "./handlers/farcasterCastAdd";

const client = new MongoClient(process.env.EVENT_DATABASE_URL);

const run = async () => {
  await client.connect();
  const db = client.db("flink");
  const eventsCollection = db.collection("events");
  const actionsCollection = db.collection("actions");

  const worker = getWorker(QueueName.Events, async (job) => {
    const rawEvent = job.data;

    let data: {
      sourceUserId?: string;
      userId?: string;
      actions?: EventAction[];
    };

    if (rawEvent.source === EventSource.FARCASTER_CAST_ADD) {
      data = await handleFarcasterCastAdd(rawEvent);
    }

    if (!data?.sourceUserId || !data?.userId || !data?.actions) {
      throw new Error(`[events] unknown event source ${rawEvent.source}`);
    }

    const result = await actionsCollection.insertMany(data.actions);

    const topics = [
      ...new Set(data.actions.flatMap((action) => action.topics)),
    ];

    const event: Event = {
      ...rawEvent,
      userId: data.userId,
      sourceUserId: data.sourceUserId,
      actions: Object.values(result.insertedIds),
      topics,
    };

    await eventsCollection.insertOne(event);

    console.log(
      `[events] processed ${event.source} ${event.sourceEventId}: ${event.actions.length} actions, ${event.topics.length} topics`,
    );
  });

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
