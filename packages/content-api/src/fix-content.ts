import { Prisma, PrismaClient } from "@nook/common/prisma/content";
import { ContentReferenceType } from "@nook/common/types";
import { QueueName, getWorker } from "@nook/common/queues";
import { getUrlContent } from "./utils";
import { ContentCacheClient, RedisClient } from "@nook/common/clients";

const run = async () => {
  const client = new PrismaClient();

  const fixContentForFid = async (fid: number) => {
    console.log(`[${fid}] fixing content`);
    const result = await client.farcasterContentReference.deleteMany({
      where: {
        fid,
        type: {
          in: [ContentReferenceType.Reply, ContentReferenceType.Quote],
        },
      },
    });

    if (result.count > 0) {
      console.log(`[${fid}] deleted ${result.count}`);
    }
  };

  if (process.argv[2]) {
    for (let i = 1; i <= 550_000; i++) {
      await fixContentForFid(i);
    }
    return;
  }

  const worker = getWorker(QueueName.Backfill, async (job) => {
    await fixContentForFid(Number(job.data.fid));
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
