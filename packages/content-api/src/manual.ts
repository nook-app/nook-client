import { Prisma, PrismaClient } from "@nook/common/prisma/content";
import { getUrlContent } from "./utils";
import { ContentCacheClient, RedisClient } from "@nook/common/clients";
import { UrlContentResponse } from "@nook/common/types";
import { Frame } from "frames.js";
import { Metadata } from "metascraper";

const run = async () => {
  const client = new PrismaClient();
  const cache = new ContentCacheClient(new RedisClient());
  const url = process.argv[2];

  const content = await getUrlContent(url);
  console.log(content);

  if (!content) return;

  await client.farcasterContentReference.updateMany({
    where: {
      uri: content.uri,
    },
    data: {
      ...content,
      type: undefined,
      contentType: content.type,
      metadata: (content.metadata || Prisma.DbNull) as Prisma.InputJsonValue,
      frame: (content.frame || Prisma.DbNull) as Prisma.InputJsonValue,
    },
  });

  await cache.setContent(content.uri, {
    ...content,
    metadata: content.metadata as Metadata,
    frame: content.frame as Frame,
  } as UrlContentResponse);
};

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
