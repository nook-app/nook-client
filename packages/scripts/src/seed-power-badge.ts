import { FarcasterCacheClient, RedisClient } from "@nook/common/clients";

export const run = async () => {
  const client = new FarcasterCacheClient(new RedisClient());

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

  const newPowerBadgeUsers = fids.map((fid: number) => fid.toString());

  const oldPowerBadgeUsers = await client.getPowerBadgeUsers();
  if (oldPowerBadgeUsers && oldPowerBadgeUsers.length > 0) {
    const delta = newPowerBadgeUsers.filter(
      (fid) => !oldPowerBadgeUsers.includes(fid),
    );

    console.log(delta);
  }

  await client.setPowerBadgeUsers(newPowerBadgeUsers);

  console.log(`Added ${newPowerBadgeUsers.length} new power badge users`);
};

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
