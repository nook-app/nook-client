import { FarcasterCacheClient, RedisClient } from "@nook/common/clients";

export const run = async () => {
  const client = new FarcasterCacheClient(new RedisClient());
  const client2 = new FarcasterCacheClient(new RedisClient("feed"));

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
  await client2.setPowerBadgeUsers(newPowerBadgeUsers);

  console.log(delta);

  console.log(`Added ${delta.length} new power badge users`);
};

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
