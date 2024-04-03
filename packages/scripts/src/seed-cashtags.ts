import { PrismaClient } from "@nook/common/prisma/nook";

export const run = async () => {
  const prisma = new PrismaClient();

  await prisma.cashtag.createMany({
    skipDuplicates: true,
    data: [
      {
        cashtag: "$degen",
      },
      {
        cashtag: "$onchain",
      },
      {
        cashtag: "$enjoy",
      },
      {
        cashtag: "$higher",
      },
      {
        cashtag: "$imagine",
      },
    ],
  });
};

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
