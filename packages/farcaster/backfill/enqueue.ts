import { QueueName, getQueue } from "@nook/common/queues";

const run = async () => {
  const queue = getQueue(QueueName.Backfill);

  const batchSize = 1000;
  const totalItems = 387000;

  for (let i = 1; i <= totalItems; i += batchSize) {
    console.log(`Adding batch ${i} to ${i + batchSize}`);
    const batch = [];
    for (let j = i; j <= batchSize; j++) {
      batch.push({ name: `backfill-${j}`, data: { fid: j.toString() } });
    }
    await queue.addBulk(batch); // Add the current batch
  }
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
