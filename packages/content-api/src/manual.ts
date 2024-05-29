import { Prisma, PrismaClient } from "@nook/common/prisma/content";
import { getUrlContent } from "./utils";
import { ContentCacheClient, RedisClient } from "@nook/common/clients";
import { UrlContentResponse } from "@nook/common/types";
import { Frame } from "frames.js";
import { Metadata } from "metascraper";

const run = async () => {
  const client = new PrismaClient();
  const cache = new ContentCacheClient(new RedisClient("feed"));
  const url = process.argv[2];

  const content = await getUrlContent(url);
  console.log(content);

  if (!content) return;

  const references = await client.farcasterContentReference.findMany({
    where: {
      uri: content.uri,
    },
  });

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

  const newContent = {
    ...content,
    metadata: content.metadata as Metadata,
    frame: content.frame as Frame,
  } as UrlContentResponse;

  console.log("updating", references.length, "references");

  await cache.setContent(content.uri, newContent);
  await cache.setReferences(
    references.map((r) => [
      {
        ...r,
        fid: r.fid.toString(),
        parentFid: r.parentFid?.toString(),
        rootParentFid: r.rootParentFid?.toString(),
        parentHash: r.parentHash || undefined,
        parentUrl: r.parentUrl || undefined,
        rootParentHash: r.rootParentHash || undefined,
        rootParentUrl: r.rootParentUrl || undefined,
        text: r.text || undefined,
      },
      newContent,
    ]),
  );
};

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
