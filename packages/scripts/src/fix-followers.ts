import { Message, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { FarcasterLink, PrismaClient } from "@nook/common/prisma/farcaster";
import { QueueName, getWorker } from "@nook/common/queues";
import { messageToLink } from "@nook/common/farcaster";
import { FarcasterCacheClient, RedisClient } from "@nook/common/clients";

const run = async () => {
  const client = new PrismaClient();
  const cache = new FarcasterCacheClient(new RedisClient());
  const hubRpcEndpoint = process.env.HUB_RPC_ENDPOINT;
  if (!hubRpcEndpoint) {
    throw new Error("Missing HUB_RPC_ENDPOINT");
  }

  const hub = getSSLHubRpcClient("nemes.farcaster.xyz:2283");

  const fixFollowersForFid = async (fid: string) => {
    const messages: Message[] = [];

    let pageToken: Uint8Array | undefined = undefined;
    do {
      const response = await hub.getLinksByFid({
        fid: Number(fid),
        pageToken,
      });

      if (response.isErr()) {
        throw new Error(
          `failed to get messages for fid: ${fid}`,
          response.error,
        );
      }

      messages.push(...response.value.messages);
      pageToken = response.value.nextPageToken;
    } while (pageToken?.length);

    const linkMap = messages.reduce(
      (acc, message) => {
        const link = messageToLink(message);
        if (!link) return acc;
        acc[link.targetFid.toString()] = link;
        return acc;
      },
      {} as Record<string, FarcasterLink>,
    );

    const links = Object.values(linkMap);

    console.log(`[${fid}] found ${links.length} links`);

    await Promise.all([
      client.farcasterUserStats.update({
        where: {
          fid: Number(fid),
        },
        data: {
          following: links.length,
        },
      }),
      client.farcasterLink.createMany({
        data: links,
        skipDuplicates: true,
      }),
      client.farcasterLink.updateMany({
        where: {
          fid: Number(fid),
          targetFid: {
            in: links.map((link) => link.targetFid),
          },
          deletedAt: {
            not: null,
          },
        },
        data: {
          deletedAt: null,
        },
      }),
      client.farcasterLink.updateMany({
        where: {
          fid: Number(fid),
          targetFid: {
            notIn: links.map((link) => link.targetFid),
          },
        },
        data: {
          deletedAt: new Date(),
        },
      }),
      cache.deleteUserEngagement(fid),
      cache.deleteUserFollowingFids(fid),
    ]);
  };

  if (process.argv[2]) {
    await fixFollowersForFid(process.argv[2]);
    return;
  }

  const worker = getWorker(QueueName.Backfill, async (job) => {
    const fid = job.data.fid;
    await fixFollowersForFid(fid);
    console.log(`[${job.id}] processed`);
  });

  worker.on("failed", (job, err) => {
    if (job) {
      console.log(`[${job.id}] failed with ${err.message}`);
    }
  });
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
