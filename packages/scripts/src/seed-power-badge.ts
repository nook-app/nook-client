import { FarcasterCacheClient, RedisClient } from "@nook/common/clients";

export const run = async () => {
  const client = new FarcasterCacheClient(new RedisClient());
  const response = await fetch("https://api.warpcast.com/v2/power-badge-users");

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const {
    result: { fids },
  } = await response.json();

  if (!fids || fids.length === 0) {
    throw new Error("No fids found");
  }

  await client.setPowerBadgeUsers(fids.map((fid: number) => fid.toString()));

  console.log(await client.getPowerBadgeUsers());
};

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
