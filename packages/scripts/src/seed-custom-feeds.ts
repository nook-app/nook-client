import { PrismaClient } from "@nook/common/prisma/nook";

const FEEDS = [
  {
    fid: "3887",
    name: "External Feed Demo",
    api: "https://nook-agent-template.fly.dev/feed",
    filter: {},
    type: "default",
  },
  {
    fid: "13659",
    name: "External Feed Demo",
    api: "https://nook-agent-template.fly.dev/feed",
    filter: {},
    type: "default",
  },
];

const run = async () => {
  const client = new PrismaClient();

  await Promise.all(
    FEEDS.map((feed) =>
      client.feed.create({
        data: feed,
      }),
    ),
  );
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
