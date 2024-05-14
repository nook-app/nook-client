import { PrismaClient } from "@nook/common/prisma/notifications";
import { QueueName, getQueue } from "@nook/common/queues";
import {
  Notification,
  NotificationService,
  NotificationType,
} from "@nook/common/types";
import { getNotificationsHandler } from "./handlers";
import { pushMessages } from "./handlers/push";

export const run = async () => {
  const client = new PrismaClient();

  if (process.argv[2] === "raw") {
    const token = await client.user.findFirst({
      where: {
        fid: process.argv[3],
      },
    });
    if (!token?.token || !token.receive || token.disabled) return;
    await pushMessages([
      {
        to: token.token,
        title: "Kartik tested",
        body: "This is a test notification",
        data: {
          image: "https://i.imgur.com/B9BuItx.jpeg",
        },
        categoryId: "test",
        mutableContent: true,
      },
    ]);
    return;
  }

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

    const notification = await client.notification.findFirst({
      where: {
        fid,
        type: type?.toUpperCase(),
        deletedAt: null,
        powerBadge: true,
        sourceFid: {
          not: fid,
        },
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
