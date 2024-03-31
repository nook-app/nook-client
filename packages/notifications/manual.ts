import { PrismaClient } from "@nook/common/prisma/notifications";
import { QueueName, getQueue } from "@nook/common/queues";
import {
  Notification,
  NotificationService,
  NotificationType,
} from "@nook/common/types";
import { getNotificationsHandler } from "./handlers";

export const run = async () => {
  const client = new PrismaClient();

  const queue = getQueue(QueueName.Notifications);
  console.log(`Running for notification ${process.argv[2]}`);
  const job = await queue.getJob(process.argv[2]);
  const handler = await getNotificationsHandler();
  if (job) {
    await handler(job);
  } else {
    const fid = process.argv[2];
    const type = process.argv[3];

    if (!fid) {
      throw new Error("No fid provided");
    }

    const user = await client.user.findFirst({
      where: {
        fid,
      },
    });

    if (!user || user?.disabled || !user?.receive) {
      throw new Error(
        "User not found or disabled or not receiving notifications",
      );
    }

    const notification = await client.notification.findFirst({
      where: {
        fid,
        type: type?.toUpperCase(),
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    if (!notification) {
      throw new Error("No notification found");
    }

    const data: Notification = {
      ...notification,
      service: notification.service as NotificationService,
      type: notification.type as NotificationType,
      // biome-ignore lint/suspicious/noExplicitAny: generic cast
      data: notification.data as any,
      deletedAt: notification.deletedAt || undefined,
    };

    // @ts-ignore
    await handler({ data });
  }
};

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
