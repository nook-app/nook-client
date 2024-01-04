import { QueueName, getQueue } from "@flink/common/queues";
import { MongoClient } from "mongodb";
import {
  Content,
  EventAction,
  EventSourceService,
  RawEvent,
  UserEvent,
} from "@flink/common/types";
import { Job } from "bullmq";
import { handleFarcasterCastAdd } from "./handlers/farcasterCastAdd";

const client = new MongoClient(process.env.EVENT_DATABASE_URL);

export const getEventsHandler = async () => {
  await client.connect();
  const db = client.db("flink");
  const eventsCollection = db.collection("events");
  const actionsCollection = db.collection("actions");

  const contentQueue = getQueue(QueueName.ContentIngress);

  return async (job: Job<RawEvent>) => {
    const rawEvent = job.data;

    let data:
      | {
          sourceUserId: string;
          userId: string;
          actions: EventAction[];
          content: Content[];
          createdAt: Date;
        }
      | undefined;

    if (rawEvent.source.service === EventSourceService.FARCASTER_CAST_ADD) {
      data = await handleFarcasterCastAdd(rawEvent);
    }

    if (!data) {
      throw new Error(`[events] unknown event source ${rawEvent.source}`);
    }

    await actionsCollection.deleteMany({
      eventId: rawEvent.eventId,
    });
    const result = await actionsCollection.insertMany(data.actions);

    const event: UserEvent = {
      ...rawEvent,
      userId: data.userId,
      sourceUserId: data.sourceUserId,
      actions: Object.values(result.insertedIds),
      createdAt: data.createdAt,
    };

    await eventsCollection.findOneAndUpdate(
      {
        eventId: rawEvent.eventId,
      },
      { $set: event },
      {
        upsert: true,
      },
    );

    for (const content of data.content) {
      await contentQueue.add(content.contentId, content);
    }

    console.log(
      `[events] processed ${event.source.service} ${event.source.id}: ${event.actions.length} actions`,
    );
  };
};
