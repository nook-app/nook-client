import { QueueName, getWorker } from "@nook/common/queues";
import { FarcasterContentReference } from "@nook/common/types";
import { ContentAPIClient } from "@nook/common/clients";

const run = async () => {
  const api = new ContentAPIClient();

  const worker = getWorker(QueueName.Content, async (job) => {
    const reference = job.data as FarcasterContentReference;

    await api.getReferences([reference]);

    console.log(`[${job.id}] processed`);
  });

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
