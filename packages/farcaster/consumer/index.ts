import { QueueName, getWorker } from "@flink/common/queues";
import { getFarcasterHandler } from "./handlers";

const run = async () => {
  const worker = getWorker(QueueName.FarcasterIngress, getFarcasterHandler());

  worker.on("failed", (job, err) => {
    if (job) {
      console.log(
        `[farcaster-consumer] [${job.id}] failed with ${err.message}`,
      );
    }
  });
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
