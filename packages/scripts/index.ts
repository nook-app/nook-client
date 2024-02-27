import { PrismaClient } from "@nook/common/prisma/feed";
const run = async () => {
  const client = new PrismaClient();
};

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
