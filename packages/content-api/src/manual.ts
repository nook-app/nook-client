import { Prisma, PrismaClient } from "@nook/common/prisma/content";
import { getUrlContent } from "./utils";

const run = async () => {
  const client = new PrismaClient();
  const url = process.argv[2];

  const content = await getUrlContent(url);
  console.log(content);

  if (!content) return;

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
};

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
