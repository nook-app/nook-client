import { QueueName, getQueue } from "@nook/common/queues";

const run = async () => {
  const queue = getQueue(QueueName.Backfill);

  const batchSize = 1000;
  const totalItems = 532_000;

  let batch = [];
  for (let i = 1; i <= totalItems; i++) {
    batch.push({
      name: `backfill-${i}`,
      data: { fid: i.toString() },
      opts: { jobId: `backfill-${i}`, removeOnComplete: { count: 1000 } },
    });
    if (i % batchSize === 0) {
      console.log(`Adding batch ${i - batchSize} to ${i}`);
      await queue.addBulk(batch); // Add the current batch
      batch = [];
    }
  }
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
