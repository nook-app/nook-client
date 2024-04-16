import { PrismaClient } from "@nook/common/prisma/nook";

const run = async () => {
  const client = new PrismaClient();
  await client.feed.create({
    data: {
      fid: "3887",
      name: "Nook Agent Test",
      api: "https://nook-agent-template.fly.dev/feed",
      filter: {},
      type: "default",
    },
  });
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
