import { QueueName, getWorker } from "@flink/common/queues";
import { getEventsHandler } from "./handlers";

const run = async () => {
  const queueName =
    process.argv[2] === "--backfill"
      ? QueueName.EventsBackfill
      : QueueName.Events;

  const worker = getWorker(queueName, await getEventsHandler());

  worker.on("failed", (job, err) => {
    if (job) {
      console.log(`[${job.id}] failed with ${err.message}`);
    }
  });
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
