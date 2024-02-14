import { QueueName, getQueue } from "@flink/common/queues";
import { getEventsHandler } from "./handlers";
import { MongoClient } from "@flink/common/mongo";

const run = async () => {
  const queue = getQueue(QueueName.Events);
  console.log(`Running for event ${process.argv[2]}`);
  const job = await queue.getJob(process.argv[2]);
  if (job) {
    const handler = await getEventsHandler();
    await handler(job);
  } else {
    const client = new MongoClient();
    await client.connect();
    const event = await client.findEvent(process.argv[2]);
    const handler = await getEventsHandler();
    // @ts-ignore
    await handler({ data: JSON.parse(JSON.stringify(event)) });
  }
};

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
