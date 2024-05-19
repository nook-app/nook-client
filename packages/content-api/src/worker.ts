import { Prisma, PrismaClient } from "@nook/common/prisma/content";
import { QueueName, getWorker } from "@nook/common/queues";
import { getUrlContent } from "./utils";

const run = async () => {
  const client = new PrismaClient();

  const worker = getWorker(QueueName.Content, async (job) => {
    const uri = job.data.uri;
    const result = await getUrlContent(uri);
    if (!result) return;

    await client.farcasterContentReference.updateMany({
      where: {
        uri,
      },
      data: {
        ...result,
        metadata: (result.metadata || Prisma.DbNull) as Prisma.InputJsonValue,
        frame: (result.frame || Prisma.DbNull) as Prisma.InputJsonValue,
      },
    });
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
