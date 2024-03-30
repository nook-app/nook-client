import { PrismaClient } from "@nook/common/prisma/farcaster";
import { PrismaClient as SignerClient } from "@nook/common/prisma/signer";

export const run = async () => {
  const client = new PrismaClient();
  const signer = new SignerClient();

  const nookSigners = await signer.signer.findMany({
    where: {
      state: "completed",
    },
    select: {
      publicKey: true,
    },
  });

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    dates.push(date);
  }

  console.log("getting total counts");
  const userCounts = await Promise.all(
    dates.map(async (date) => {
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      return await client.farcasterCast.count({
        where: {
          timestamp: {
            gt: date,
            lt: nextDay,
          },
        },
      });
    }),
  );

  console.log("getting nook counts");
  const nookCounts = await Promise.all(
    dates.map(async (date) => {
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      return await client.farcasterCast.count({
        where: {
          timestamp: {
            gt: date,
            lt: nextDay,
          },
          signer: {
            in: nookSigners.map((signer) => signer.publicKey),
          },
        },
      });
    }),
  );

  for (let i = 0; i < 7; i++) {
    console.log(
      `${dates[i].toISOString().split("T")[0]} - ${(
        (nookCounts[i] / userCounts[i]) *
        100
      ).toFixed(6)}% all:${userCounts[i]}, nook:${nookCounts[i]}`,
    );
  }
};

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
