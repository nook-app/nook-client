import { QueueName, getWorker } from "@nook/common/queues";
import { ContentAPIClient, FarcasterAPIClient } from "@nook/common/clients";
import { UserFilterType } from "@nook/common/types";

const run = async () => {
  const farcasterApi = new FarcasterAPIClient();
  const contentApi = new ContentAPIClient();

  // const backfillContentForFid = async (fid: string) => {
  //   let nextCursor: string | undefined;
  //   let count = 0;
  //   do {
  //     const casts = await farcasterApi.getFeed(
  //       {
  //         filter: {
  //           users: {
  //             type: UserFilterType.FIDS,
  //             args: {
  //               fids: [fid],
  //             },
  //           },
  //         },
  //       },
  //       nextCursor,
  //     );
  //     await Promise.all(
  //       casts.data.map((cast) => contentApi.addContentReferences(cast)),
  //     );
  //     console.log(fid, nextCursor);
  //     nextCursor = casts.nextCursor;
  //     count += casts.data.length;
  //   } while (nextCursor);

  //   console.log(`[${fid}] backfilled ${count} casts`);
  // };

  // if (process.argv[2]) {
  //   await backfillContentForFid(process.argv[2]);
  //   return;
  // }

  const worker = getWorker(QueueName.Backfill, async (job) => {
    console.log(`[${job.data.fid}] backfilling cache`);
    // await backfillContentForFid(job.data.fid);
    console.log(`[${job.data.fid}] backfilled cache`);
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
