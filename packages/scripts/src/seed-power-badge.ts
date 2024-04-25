import { FarcasterCacheClient, RedisClient } from "@nook/common/clients";
import { PrismaClient } from "@nook/common/prisma/notifications";

export const run = async () => {
  const client = new FarcasterCacheClient(new RedisClient());
  const notifications = new PrismaClient();

  const response = await fetch("https://api.warpcast.com/v2/power-badge-users");

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const {
    result: { fids },
  }: { result: { fids: number[] } } = await response.json();

  if (!fids || fids.length === 0) {
    throw new Error("No fids found");
  }

  const oldPowerBadgeUsers = await client.getPowerBadgeUsers();
  const newPowerBadgeUsers = fids.map((fid: number) => fid.toString());

  const delta = newPowerBadgeUsers.filter(
    (fid) => !oldPowerBadgeUsers.includes(fid),
  );

  await client.setPowerBadgeUsers(newPowerBadgeUsers);

  console.log(delta);

  console.log(`Added ${delta.length} new power badge users`);

  for (const fid of delta) {
    await notifications.notification.updateMany({
      where: {
        sourceFid: fid.toString(),
      },
      data: {
        powerBadge: true,
      },
    });
    console.log(fid);
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
