import { FarcasterCacheClient, RedisClient } from "@nook/common/clients";
import { PrismaClient } from "@nook/common/prisma/notifications";

const run = async () => {
  const client = new PrismaClient();
  const cache = new FarcasterCacheClient(new RedisClient());

  const powerBadges = await cache.getPowerBadgeUsers();

  const fids = new Array(500_000).fill(0).map((_, i) => (i + 1).toString());
  const nonPowerBadge = fids.filter((fid) => !powerBadges.includes(fid));

  const batchSize = 100;
  for (let i = 0; i < nonPowerBadge.length; i += batchSize) {
    const batch = nonPowerBadge.slice(i, i + batchSize);
    const badNotifications = await client.notification.findMany({
      where: {
        powerBadge: true,
        sourceFid: {
          in: batch,
        },
      },
    });

    for (let j = 0; j < badNotifications.length; j += batchSize) {
      const badBatch = badNotifications.slice(j, j + batchSize);
      const result = await client.notification.updateMany({
        where: {
          OR: badBatch.map((notification) => ({
            fid: notification.fid,
            service: notification.service,
            type: notification.type,
            sourceId: notification.sourceId,
          })),
        },
        data: {
          powerBadge: false,
        },
      });
      console.log(i, result.count);
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
