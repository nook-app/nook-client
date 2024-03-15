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

  console.log(`[channels] upserting ${channels.length} channels`);
  await client.farcasterParentUrl.createMany({
    data: channels,
    skipDuplicates: true,
  });

  let i = 1;
  for (const channel of channels) {
    console.log(
      `[${i}] [${channel.channelId}] upserting stats for ${channel.url}`,
    );
    const [casts, replies] = await Promise.all([
      client.farcasterCast.count({
        where: {
          parentUrl: channel.url,
          deletedAt: null,
          parentHash: null,
        },
      }),
      client.farcasterCast.count({
        where: {
          rootParentUrl: channel.url,
          deletedAt: null,
          parentHash: { not: null },
        },
      }),
    ]);

    await client.farcasterParentUrlStats.upsert({
      where: { url: channel.url },
      create: {
        url: channel.url,
        casts: casts,
        replies: replies,
      },
      update: {
        casts: casts,
        replies: replies,
      },
    });

    i++;
  }
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
