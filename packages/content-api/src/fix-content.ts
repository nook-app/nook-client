import { Prisma, PrismaClient } from "@nook/common/prisma/content";
import { ContentReferenceType } from "@nook/common/types";
import { QueueName, getWorker } from "@nook/common/queues";
import { getUrlContent } from "./utils";

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

    console.log(`[${fid}] missing ${missingContentTypes.length}`);

    const urls = missingContentTypes.map((content) => content.uri);
    for (let j = 0; j < urls.length; j += 10) {
      const batch = urls.slice(j, j + 10);
      await Promise.all(
        batch.map(async (url) => {
          console.log(`[${fid}] fetching ${url}`);
          const content = await getUrlContent(url);
          if (!content) return;
          await client.farcasterContentReference.updateMany({
            where: {
              uri: content.uri,
            },
            data: {
              ...content,
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
