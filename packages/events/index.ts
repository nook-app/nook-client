import { QueueName, getWorker } from "@flink/common/queues";
import { Job } from "bullmq";
import { MongoClient } from "mongodb";
import { Event, EventSource, RawEvent } from "@flink/common/types";

const client = new MongoClient(process.env.EVENT_DATABASE_URL);

const run = async () => {
  await client.connect();
  const db = client.db("flink");
  const collection = db.collection("events");

  const worker = getWorker(QueueName.Events, async (job) => {
    const rawEvent = job.data;

    let sourceUserId: string | undefined;
    let preprocessedUserIds: string[] | undefined;

    if (rawEvent.source === EventSource.FARCASTER) {
      preprocessedUserIds = [
        rawEvent.data.fid,
        rawEvent.data.parentFid,
        rawEvent.data.rootParentFid,
        ...rawEvent.data.mentions.map((mention) => mention.mention),
        ...rawEvent.data.castEmbeds.map((embed) => embed.fid),
      ].filter(Boolean);
      sourceUserId = rawEvent.data.fid;
    }

    const userIds = await Promise.all(
      preprocessedUserIds.map(async (userId) => {
        const res = await fetch(
          `${process.env.IDENTITY_SERVICE_URL}/identity/by-fid/${userId}`,
        );
        if (!res.ok) {
          console.log(`[events] error fetching identity for fid ${userId}`);
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
      ...rawEvent,
      userId,
      topics: [],
      actions: [],
    };

    // TODO: if not exists
    await collection.insertOne(event);

    console.log(`[events] processed ${job.id}`);
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

// weird scenario: replying to a transaction
// re-evalute standardized fields

/*
use cases
1. home feed
2. post
3. activity
4. content
5. user post feed
6. user activity feed
7. user content
8. content post feed
9. content activity feed
11. rich embeds
12. transaction referral
13. notification topics
*/
