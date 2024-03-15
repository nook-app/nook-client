import { QueueName, getWorker } from "@nook/common/queues";
import { PrismaClient as FarcasterClient } from "@nook/common/prisma/farcaster";
import { PrismaClient as NotificationsClient } from "@nook/common/prisma/notifications";
import {
  parseNotificationsFromCast,
  parseNotificationsFromLink,
  parseNotificationsFromReaction,
} from "@nook/common/farcaster";

const run = async () => {
  const farcaster = new FarcasterClient();
  const notifications = new NotificationsClient();

  const backfillNotificationsForFid = async (fid: number) => {
    const [casts, reactions, links] = await Promise.all([
      farcaster.farcasterCast.findMany({
        where: {
          fid,
          timestamp: {
            gt: new Date("2024-01-01"),
          },
        },
      }),
      farcaster.farcasterCastReaction.findMany({
        where: {
          fid,
          timestamp: {
            gt: new Date("2024-01-01"),
          },
        },
      }),
      farcaster.farcasterLink.findMany({
        where: {
          fid,
          timestamp: {
            gt: new Date("2024-01-01"),
          },
        },
      }),
    ]);

    const castNotifications = casts.flatMap(parseNotificationsFromCast);
    const reactionNotifications = reactions.flatMap(
      parseNotificationsFromReaction,
    );
    const linkNotifications = links.flatMap(parseNotificationsFromLink);

    const notificationsToCreate = castNotifications.concat(
      reactionNotifications,
      linkNotifications,
    );

    await notifications.notification.createMany({
      data: notificationsToCreate,
      skipDuplicates: true,
    });

    console.log(
      `[${fid}] backfilled ${notificationsToCreate.length} notifications`,
    );
  };

  if (process.argv[2]) {
    await backfillNotificationsForFid(parseInt(process.argv[2], 10));
    return;
  }

  const worker = getWorker(QueueName.Backfill, async (job) => {
    console.log(`[${job.data.fid}] backfilling notifications`);
    await backfillNotificationsForFid(parseInt(job.data.fid, 10));
    console.log(`[${job.data.fid}] backfilled notifications`);
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
