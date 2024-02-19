import { QueueName, getQueue } from "@nook/common/queues";
import { PrismaClient } from "@nook/common/prisma/farcaster";

const prisma = new PrismaClient();

const run = async () => {
  const hubRpcEndpoint = process.env.HUB_RPC_ENDPOINT;
  if (!hubRpcEndpoint) {
    throw new Error("Missing HUB_RPC_ENDPOINT");
  }

  // const { fid } = await prisma.farcasterUser.findFirst({
  //   orderBy: {
  //     fid: "desc",
  //   },
  // });
  const fid = 100;

  const array = Array.from({ length: Number(fid) }, (_, i) => i + 1);

  const queue = getQueue(QueueName.FarcasterBackfill);

  await queue.addBulk(
    array.map((fid) => ({
      name: `backfill-${fid}`,
      data: { fid: fid.toString() },
      opts: { jobId: `backfill-${fid}` },
    })),
  );
};

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
