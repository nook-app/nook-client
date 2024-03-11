import { PrismaClient } from "@nook/common/prisma/farcaster";
import { QueueName, getWorker } from "@nook/common/queues";

const run = async () => {
  const client = new PrismaClient();

  const getFollowers = async (fid: number) => {
    return await client.farcasterLink.count({
      where: {
        targetFid: fid,
        linkType: "follow",
        deletedAt: null,
      },
    });
  };

  const getFollowing = async (fid: number) => {
    return await client.farcasterLink.count({
      where: {
        fid,
        linkType: "follow",
        deletedAt: null,
      },
    });
  };

  const getCasts = async (fid: number) => {
    return await client.farcasterCast.count({
      where: {
        fid,
        parentHash: null,
        deletedAt: null,
      },
    });
  };

  const getReplies = async (fid: number) => {
    return await client.farcasterCast.count({
      where: {
        fid,
        parentHash: { not: null },
        deletedAt: null,
      },
    });
  };

  const getLikes = async (fid: number) => {
    return await client.farcasterCastReaction.count({
      where: {
        fid,
        reactionType: 1,
        deletedAt: null,
      },
    });
  };

  const getRecasts = async (fid: number) => {
    return await client.farcasterCastReaction.count({
      where: {
        fid,
        reactionType: 2,
        deletedAt: null,
      },
    });
  };

  const getRepliesReceived = async (fid: number) => {
    return await client.farcasterCast.count({
      where: {
        parentFid: fid,
        deletedAt: null,
      },
    });
  };

  const getLikesReceived = async (fid: number) => {
    return await client.farcasterCastReaction.count({
      where: {
        targetFid: fid,
        reactionType: 1,
        deletedAt: null,
      },
    });
  };

  const getRecastsReceived = async (fid: number) => {
    return await client.farcasterCastReaction.count({
      where: {
        targetFid: fid,
        reactionType: 2,
        deletedAt: null,
      },
    });
  };

  const backfillUserStatsForFid = async (fid: number) => {
    const [
      followers,
      following,
      casts,
      replies,
      likes,
      recasts,
      repliesReceived,
      likesReceived,
      recastsReceived,
    ] = await Promise.all([
      getFollowers(fid),
      getFollowing(fid),
      getCasts(fid),
      getReplies(fid),
      getLikes(fid),
      getRecasts(fid),
      getRepliesReceived(fid),
      getLikesReceived(fid),
      getRecastsReceived(fid),
    ]);

    await client.farcasterUserStats.upsert({
      where: { fid },
      create: {
        fid,
        followers,
        following,
        casts,
        replies,
        likes,
        recasts,
        repliesReceived,
        likesReceived,
        recastsReceived,
      },
      update: {
        followers,
        following,
        casts,
        replies,
        likes,
        recasts,
        repliesReceived,
        likesReceived,
        recastsReceived,
      },
    });
  };

  const getLikesForCasts = async (fid: number) => {
    return await client.farcasterCastReaction.groupBy({
      by: ["targetHash"],
      where: {
        targetFid: fid,
        reactionType: 1,
        deletedAt: null,
      },
      _count: {
        targetHash: true,
      },
    });
  };

  const getRecastsForCasts = async (fid: number) => {
    return await client.farcasterCastReaction.groupBy({
      by: ["targetHash"],
      where: {
        targetFid: fid,
        reactionType: 2,
        deletedAt: null,
      },
      _count: {
        targetHash: true,
      },
    });
  };

  const getQuotesForCasts = async (fid: number) => {
    return await client.farcasterCastEmbedCast.groupBy({
      by: ["embedHash"],
      where: {
        embedFid: fid,
        deletedAt: null,
      },
      _count: {
        embedHash: true,
      },
    });
  };

  const getRepliesForCasts = async (fid: number) => {
    return await client.farcasterCast.groupBy({
      by: ["parentHash"],
      where: {
        parentFid: fid,
        parentHash: { not: null },
        deletedAt: null,
      },
      _count: {
        parentHash: true,
      },
    });
  };

  const backfillCastStatsForFid = async (fid: number) => {
    const [likes, recasts, quotes, replies] = await Promise.all([
      getLikesForCasts(fid),
      getRecastsForCasts(fid),
      getQuotesForCasts(fid),
      getRepliesForCasts(fid),
    ]);

    const likesMap = likes.reduce(
      (acc, { targetHash, _count }) => {
        acc[targetHash] = _count.targetHash;
        return acc;
      },
      {} as Record<string, number>,
    );

    const recastsMap = recasts.reduce(
      (acc, { targetHash, _count }) => {
        acc[targetHash] = _count.targetHash;
        return acc;
      },
      {} as Record<string, number>,
    );

    const quotesMap = quotes.reduce(
      (acc, { embedHash, _count }) => {
        acc[embedHash] = _count.embedHash;
        return acc;
      },
      {} as Record<string, number>,
    );

    const repliesMap = replies.reduce(
      (acc, { parentHash, _count }) => {
        // @ts-ignore
        acc[parentHash] = _count.parentHash;
        return acc;
      },
      {} as Record<string, number>,
    );

    const hashes = [
      ...Object.keys(likesMap),
      ...Object.keys(recastsMap),
      ...Object.keys(quotesMap),
      ...Object.keys(repliesMap),
    ];

    const uniqueHashes = new Set(hashes);

    await client.farcasterCastStats.deleteMany({
      where: {
        fid,
      },
    });

    await client.farcasterCastStats.createMany({
      data: Array.from(uniqueHashes).map((hash) => {
        return {
          fid,
          hash,
          likes: likesMap[hash] || 0,
          recasts: recastsMap[hash] || 0,
          quotes: quotesMap[hash] || 0,
          replies: repliesMap[hash] || 0,
        };
      }),
      skipDuplicates: true,
    });
  };

  const worker = getWorker(QueueName.Backfill, async (job) => {
    const fid = Number(job.data.fid);
    console.log(`[${fid}] backfilling user stats`);
    await backfillUserStatsForFid(fid);
    console.log(`[${fid}] backfilled user stats`);

    console.log(`[${fid}] backfilling cast stats`);
    await backfillCastStatsForFid(fid);
    console.log(`[${fid}] backfilled cast stats`);
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
