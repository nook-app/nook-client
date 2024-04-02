import { Prisma, PrismaClient } from "@nook/common/prisma/content";
import { getUrlContent } from "./utils";

export const run = async () => {
  const client = new PrismaClient();

  if (!process.argv[2]) {
    console.error("Please provide a URL to refresh");
    process.exit(1);
  }

  const urls = await client.urlContent.findMany({
    where: {
      uri: {
        startsWith: process.argv[2],
      },
    },
  });

  for (const url of urls) {
    console.log(url.uri);
    const content = await getUrlContent(url.uri);
    if (!content) continue;
    await client.urlContent.upsert({
      where: {
        uri: content.uri,
      },
      create: {
        ...content,
        metadata: (content.metadata || Prisma.DbNull) as Prisma.InputJsonValue,
        frame: (content.frame || Prisma.DbNull) as Prisma.InputJsonValue,
      },
      update: {
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
