import { QueueName, getQueue } from "@nook/common/queues";

const BATCH_SIZE = 1000;

const run = async () => {
  const queue = getQueue(QueueName.FarcasterBackfill);

  for (let fid = 180_000; fid < 315_000; fid += BATCH_SIZE) {
    const jobs = [];
    for (let j = fid; j < fid + BATCH_SIZE && j < 365_000; j++) {
      jobs.push({
        name: `fid-${j}`,
        data: { fid: j.toString() },
        opts: {
          jobId: `fid-${j}`,
          removeOnComplete: {
            count: 10000,
          },
        },
      });
    }
    await queue.addBulk(jobs);
    console.log(`added jobs for fids ${fid}-${fid + BATCH_SIZE}`);
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
