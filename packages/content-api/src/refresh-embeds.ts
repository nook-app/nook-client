import { Prisma, PrismaClient } from "@nook/common/prisma/content";
import { getUrlContent } from "./utils";

export const run = async () => {
  const client = new PrismaClient();

  if (!process.argv[2]) {
    console.error("Please provide a URL to refresh");
    process.exit(1);
  }

  const urls = await client.farcasterContentReference.findMany({
    where: {
      uri: {
        startsWith: process.argv[2],
      },
      timestamp: {
        gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      },
    },
  });

  console.log(`Found ${urls.length} URLs`);

  for (const url of urls) {
    console.log(url.uri);
    const content = await getUrlContent(url.uri);
    if (!content) continue;
    await client.farcasterContentReference.updateMany({
      where: {
        uri: content.uri,
      },
      data: {
        ...content,
        metadata: (content.metadata || Prisma.DbNull) as Prisma.InputJsonValue,
        frame: (content.frame || Prisma.DbNull) as Prisma.InputJsonValue,
      },
    });
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
