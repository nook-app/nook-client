import { Prisma, PrismaClient, UrlContent } from "@nook/common/prisma/content";

const run = async () => {
  const client = new PrismaClient();

  for (let i = 306_000; i < 500_000; i++) {
    const references = await client.farcasterContentReference.findMany({
      where: {
        fid: i,
      },
    });

    const uris = references.map((reference) => reference.uri);

    console.log(`[${i}] got ${uris.length} references`);

    const content = await client.urlContent.findMany({
      where: {
        uri: {
          in: uris,
        },
      },
    });

    const contentMap = content.reduce(
      (acc, c) => {
        acc[c.uri] = c;
        return acc;
      },
      {} as Record<string, UrlContent>,
    );

    console.log(`[${i}] got ${content.length} content`);

    const BATCH_SIZE = 100;
    for (let j = 0; j < references.length; j += BATCH_SIZE) {
      const batch = references.slice(j, j + BATCH_SIZE);
      console.log(`[${i}] processing batch ${j}`);
      await Promise.all(
        batch.map(async (r) => {
          const c = contentMap[r.uri];
          if (!c) {
            console.log(`[${i}] missing content for ${r.uri}`);
            return;
          }
          await client.farcasterContentReference.update({
            where: {
              uri_fid_hash_type: {
                fid: r.fid,
                hash: r.hash,
                type: r.type,
                uri: r.uri,
              },
            },
            data: {
              protocol: c.protocol,
              host: c.host,
              path: c.path,
              query: c.query,
              fragment: c.fragment,
              contentType: c.type,
              length: c.length,
              metadata: (c.metadata || Prisma.DbNull) as Prisma.InputJsonValue,
              frame: (c.frame || Prisma.DbNull) as Prisma.InputJsonValue,
              hasFrame: c.hasFrame,
            },
          });
        }),
      );
    }
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
