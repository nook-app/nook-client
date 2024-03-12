import { QueueName, getWorker } from "@nook/common/queues";
import { ContentAPIClient, FarcasterAPIClient } from "@nook/common/clients";

const run = async () => {
  const farcasterApi = new FarcasterAPIClient();
  const contentApi = new ContentAPIClient();

  const backfillContentForFid = async (fid: string) => {
    let nextCursor: string | undefined;
    let count = 0;
    do {
      const casts = await farcasterApi.getCastsByFids({
        fids: [fid],
        cursor: nextCursor,
      });
      await Promise.all(
        casts.data.map((cast) => contentApi.addContentReferences(cast)),
      );
      nextCursor = casts.nextCursor;
      count += casts.data.length;
    } while (nextCursor);

    console.log(`[${fid}] backfilled ${count} casts`);
  };

  const worker = getWorker(QueueName.Backfill, async (job) => {
    await backfillContentForFid(job.data.fid);
    console.log(`[${job.data.fid}] backfilled cache`);
  });

  worker.on("failed", (job, err) => {
    if (job) {
      console.log(`[${job.id}] failed with ${err.message}`);
    }
  });

  await backfillContentForFid("30");
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
