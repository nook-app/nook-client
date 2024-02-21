import { MongoClient } from "@nook/common/mongo";
import { PrismaClient } from "@nook/common/prisma/farcaster";

const prisma = new PrismaClient();

const processFid = async (client: MongoClient, fid: number) => {
  console.time(`[${fid}] backfill took`);

  const userDatas = await prisma.farcasterUserData.findMany({
    where: { fid: fid },
  });

  console.log(userDatas);

  console.timeEnd(`[${fid}] backfill took`);
};

const run = async () => {
  const client = new MongoClient();
  await client.connect();

  const inputFid = process.argv[2];
  if (inputFid) {
    await processFid(client, Number(inputFid));
    process.exit(0);
  }
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
