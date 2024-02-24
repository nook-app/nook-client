import { QueueName, getWorker } from "@nook/common/queues";
import { CountSyncProcessor } from "../processors/countSyncProcessor";

const run = async () => {
  const processor = new CountSyncProcessor();

  const inputFid = process.argv[2];
  if (inputFid) {
    await processor.syncFid(Number(inputFid));
    process.exit(0);
  }

  const worker = getWorker(QueueName.Backfill, async (job) => {
    const fid = Number(job.data.fid);
    await processor.syncFid(fid);

    console.log(`processing fid: ${fid}`);
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
