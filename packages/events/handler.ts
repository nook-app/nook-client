import { MongoClient } from "mongodb";
import {
  Content,
  EventAction,
  EventService,
  RawEvent,
  UserEvent,
} from "@flink/common/types";
import { Job } from "bullmq";
import { transformCastAddToEvent } from "./handlers/farcaster/castAdd";

const client = new MongoClient(process.env.EVENT_DATABASE_URL);

export const getEventsHandler = async () => {
  await client.connect();
  const db = client.db("flink");
  const eventsCollection = db.collection("events");
  const actionsCollection = db.collection("actions");
  const contentCollection = db.collection("content");

  return async (job: Job<RawEvent>) => {
    const rawEvent = job.data;

    let data:
      | {
          event: UserEvent;
          actions: EventAction[];
          content: Content[];
        }
      | undefined;

    if (rawEvent.source.service === EventService.FARCASTER) {
      data = await transformCastAddToEvent(rawEvent);
    }

    if (!data) {
      throw new Error(
        `[events] unknown event source ${rawEvent.source.service} ${rawEvent.source.type} ${rawEvent.source.id}`,
      );
    }

    await actionsCollection.deleteMany({
      eventId: data.event._id,
    });
    await actionsCollection.insertMany(data.actions);

    await eventsCollection.findOneAndUpdate(
      {
        source: rawEvent.source,
      },
      { $set: data.event },
      {
        upsert: true,
      },
    );

    for (const content of data.content) {
      await contentCollection.findOneAndUpdate(
        {
          contentId: content.contentId,
        },
        { $set: content },
        {
          upsert: true,
        },
      );
    }

    console.log(
      `[events] processed ${data.event.source.service} ${data.event.source.id}: ${data.actions.length} actions`,
    );
  };
};
