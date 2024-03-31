import { QueueName, getWorker } from "@nook/common/queues";
import { getNotificationsHandler } from "./handlers";

const run = async () => {
  const worker = getWorker(
    QueueName.Notifications,
    await getNotificationsHandler(),
  );

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
