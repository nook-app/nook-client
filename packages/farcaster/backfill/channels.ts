import { PrismaClient } from "@nook/common/prisma/farcaster";

const run = async () => {
  const client = new PrismaClient();

  const response = await fetch("https://api.warpcast.com/v2/all-channels");
  if (!response.ok) {
    return;
  }

  const data = await response.json();
  const rawChannels: {
    id: string;
    url: string;
    name: string;
    description: string;
    imageUrl: string;
    leadFid?: number;
    createdAt: number;
  }[] = data?.result?.channels;
  if (!rawChannels) {
    return;
  }

  const channels = rawChannels.map((channel) => ({
    url: channel.url,
    channelId: channel.id,
    name: channel.name,
    description: channel.description,
    imageUrl: channel.imageUrl,
    createdAt: new Date(channel.createdAt * 1000),
    updatedAt: new Date(),
    creatorId: channel.leadFid?.toString(),
  }));

  await client.farcasterParentUrl.createMany({
    data: channels,
    skipDuplicates: true,
  });
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
