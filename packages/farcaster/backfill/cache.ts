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
      console.log(nextCursor);
    } while (nextCursor);
  };

  const worker = getWorker(QueueName.Backfill, async (job) => {
    await backfillContentForFid(job.data.fid);
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
