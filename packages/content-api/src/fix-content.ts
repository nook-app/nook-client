import { Prisma, PrismaClient } from "@nook/common/prisma/content";
import { ContentReferenceType } from "@nook/common/types";
import { QueueName, getWorker } from "@nook/common/queues";
import { getUrlContent } from "./utils";
import { ContentCacheClient, RedisClient } from "@nook/common/clients";

const run = async () => {
  const client = new PrismaClient();
  const cache = new ContentCacheClient(new RedisClient());

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

    console.log(`[${fid}] deleted ${result.count}`);

    const missingContentTypes = await client.farcasterContentReference.findMany(
      {
        where: {
          fid,
          timestamp: {
            gt: new Date("2022-05-04"),
          },
          contentType: {
            equals: null,
          },
        },
      },
    );

    const filteredMissingContentTypes = missingContentTypes.filter(
      ({ uri }) =>
        !uri.startsWith("https://altumbase.com") &&
        !uri.startsWith("https://stats-frame.degen.tips") &&
        !uri.startsWith("https://docs.google.com") &&
        !uri.startsWith("https://localhost:3000") &&
        !uri.startsWith("https://frame.fifire.xyz"),
    );

    console.log(`[${fid}] missing ${filteredMissingContentTypes.length}`);

    const urls = Array.from(
      new Set(filteredMissingContentTypes.map((content) => content.uri)),
    );
    for (let j = 0; j < urls.length; j += 10) {
      const batch = urls.slice(j, j + 5);
      await Promise.all(
        batch.map(async (url) => {
          console.log(`[${fid}] fetching ${url}`);
          let content = await cache.getContent(url);
          if (!content) {
            content = await getUrlContent(url);
            if (!content) return;
            await cache.setContent(url, content);
          }
          await client.farcasterContentReference.updateMany({
            where: {
              uri: content.uri,
            },
            data: {
              ...content,
              type: undefined,
              uri: undefined,
              hash: undefined,
              fid: undefined,
              metadata: (content.metadata ||
                Prisma.DbNull) as Prisma.InputJsonValue,
              frame: (content.frame || Prisma.DbNull) as Prisma.InputJsonValue,
            },
          });
        }),
      );
    }

    console.log(`[${fid}] fixed content`);
  };

  if (process.argv[2]) {
    await fixContentForFid(Number(process.argv[2]));
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
