import { QueueName, getWorker } from "@nook/common/queues";
import { getEventsHandler } from "./handlers";

const run = async () => {
  const worker = getWorker(QueueName.Events, await getEventsHandler());

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
