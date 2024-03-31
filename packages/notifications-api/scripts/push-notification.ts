import { PrismaClient } from "@nook/common/prisma/notifications";
import {
  Notification,
  NotificationService,
  NotificationType,
} from "@nook/common/types";
import { PushService } from "../src/service/push";

export const run = async () => {
  const client = new PrismaClient();
  // @ts-ignore
  const service = new PushService({ notifications: { client } });

  const getNotificationTokens = async (
    notification: Notification,
  ): Promise<{ fid: string; token: string; unread: number }[]> => {
    const users = await client.user.findMany({
      where: {
        fid: {
          in: [notification.fid],
        },
        receive: true,
        disabled: false,
      },
    });

    return await Promise.all(
      users.map(async (user) => {
        const unread = await client.notification.count({
          where: {
            fid: user.fid,
            read: false,
          },
        });
        return { fid: user.fid, token: user.token, unread };
      }),
    );
  };

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
  };

  await service.pushNotification(await getNotificationTokens(data), data);
};

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
