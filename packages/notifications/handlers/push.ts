import {
  FarcasterCastResponse,
  FarcasterFollowNotification,
  FarcasterLikeNotification,
  FarcasterMentionNotification,
  FarcasterPostNotification,
  FarcasterQuoteNotification,
  FarcasterRecastNotification,
  FarcasterReplyNotification,
  Notification,
  NotificationType,
} from "@nook/common/types";
import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { FarcasterAPIClient } from "@nook/common/clients";

const expo = new Expo();
const farcasterApi = new FarcasterAPIClient();

export const DB_MAX_PAGE_SIZE = 1000;
export const MAX_PAGE_SIZE = 25;

export const pushMessages = async (messages: ExpoPushMessage[]) => {
  return await expo.sendPushNotificationsAsync(messages);
};

export const pushNotification = async (
  users: { fid: string; token: string; unread: number }[],
  notification: Notification,
) => {
  const messages = await formatPushNotification(users, notification);
  for (const message of messages) {
    console.log(
      `[push-notification] [${users[0].fid}] ${message.title}: ${message.body}`,
    );
  }
  return await expo.sendPushNotificationsAsync(messages);
};

const formatPushNotification = async (
  users: { token: string; unread: number }[],
  notification: Notification,
): Promise<ExpoPushMessage[]> => {
  switch (notification.type) {
    case NotificationType.LIKE: {
      const n = notification as FarcasterLikeNotification;
      const [user, cast] = await Promise.all([
        farcasterApi.getUser(n.sourceFid),
        farcasterApi.getCast(n.data.targetHash),
      ]);
      return users.map((u) => ({
        to: u.token,
        title: `${user?.username || n.sourceFid} liked`,
        body: cast ? formatCastText(cast) : undefined,
        badge: u.unread,
        data: {
          service: n.service,
          type: NotificationType.LIKE,
          sourceId: n.sourceId,
          sourceFid: n.sourceFid,
          data: n.data,
          image: user?.pfp,
        },
        categoryId: "farcasterLike",
        mutableContent: true,
      }));
    }
    case NotificationType.RECAST: {
      const n = notification as FarcasterRecastNotification;
      const [user, cast] = await Promise.all([
        farcasterApi.getUser(n.sourceFid),
        farcasterApi.getCast(n.data.targetHash),
      ]);
      return users.map((u) => ({
        to: u.token,
        title: `${user?.username || n.sourceFid} recasted`,
        body: cast ? formatCastText(cast) : undefined,
        badge: u.unread,
        data: {
          service: n.service,
          type: NotificationType.RECAST,
          sourceId: n.sourceId,
          sourceFid: n.sourceFid,
          data: n.data,
          image: user?.pfp,
        },
        categoryId: "farcasterRecast",
        mutableContent: true,
      }));
    }
    case NotificationType.REPLY: {
      const n = notification as FarcasterReplyNotification;
      const [user, cast] = await Promise.all([
        farcasterApi.getUser(n.sourceFid),
        farcasterApi.getCast(n.data.hash),
      ]);
      return users.map((u) => ({
        to: u.token,
        title: `${user?.username || n.sourceFid} replied`,
        body: cast ? formatCastText(cast) : undefined,
        badge: u.unread,
        data: {
          service: n.service,
          type: NotificationType.REPLY,
          sourceId: n.sourceId,
          sourceFid: n.sourceFid,
          data: n.data,
          image: user?.pfp,
        },
        categoryId: "farcasterReply",
        mutableContent: true,
      }));
    }
    case NotificationType.MENTION: {
      const n = notification as FarcasterMentionNotification;
      const [user, cast] = await Promise.all([
        farcasterApi.getUser(n.sourceFid),
        farcasterApi.getCast(n.data.hash),
      ]);
      return users.map((u) => ({
        to: u.token,
        title: `${user?.username || n.sourceFid} mentioned you`,
        body: cast ? formatCastText(cast) : undefined,
        badge: u.unread,
        data: {
          service: n.service,
          type: NotificationType.MENTION,
          sourceId: n.sourceId,
          sourceFid: n.sourceFid,
          data: n.data,
          image: user?.pfp,
        },
        categoryId: "farcasterMention",
        mutableContent: true,
      }));
    }
    case NotificationType.QUOTE: {
      const n = notification as FarcasterQuoteNotification;
      const [user, cast] = await Promise.all([
        farcasterApi.getUser(n.sourceFid),
        farcasterApi.getCast(n.data.hash),
      ]);
      return users.map((u) => ({
        to: u.token,
        title: `${user?.username || n.sourceFid} quoted you`,
        body: cast ? formatCastText(cast) : undefined,
        badge: u.unread,
        data: {
          service: n.service,
          type: NotificationType.QUOTE,
          sourceId: n.sourceId,
          sourceFid: n.sourceFid,
          data: n.data,
          image: user?.pfp,
        },
        categoryId: "farcasterQuote",
        mutableContent: true,
      }));
    }
    case NotificationType.FOLLOW: {
      const n = notification as FarcasterFollowNotification;
      const [user] = await Promise.all([farcasterApi.getUser(n.sourceFid)]);
      return users.map((u) => ({
        to: u.token,
        title: `${user?.username || n.sourceFid} followed you`,
        badge: u.unread,
        data: {
          service: n.service,
          type: NotificationType.FOLLOW,
          sourceId: n.sourceId,
          sourceFid: n.sourceFid,
          data: n.data,
          image: user?.pfp,
        },
        categoryId: "farcasterFollow",
        mutableContent: true,
      }));
    }
    case NotificationType.POST: {
      const n = notification as FarcasterPostNotification;
      const [user, cast] = await Promise.all([
        farcasterApi.getUser(n.sourceFid),
        farcasterApi.getCast(n.data.hash),
      ]);
      return users.map((u) => ({
        to: u.token,
        title: `${user?.username || n.sourceFid} posted`,
        body: cast ? formatCastText(cast) : undefined,
        badge: u.unread,
        data: {
          service: n.service,
          type: NotificationType.POST,
          sourceId: n.sourceId,
          sourceFid: n.sourceFid,
          data: n.data,
          image: user?.pfp,
        },
        categoryId: "farcasterPost",
        mutableContent: true,
      }));
    }
    default:
      throw new Error("Invalid notification type");
  }
};

export const formatCastText = (cast: FarcasterCastResponse) => {
  const parts = [];
  const textBuffer = Buffer.from(cast.text.replaceAll(/\uFFFC/g, ""), "utf-8");
  let index = textBuffer.length;
  const sortedMentions = [...cast.mentions, ...cast.channelMentions]
    .sort((a, b) => Number(b.position) - Number(a.position))
    .filter(
      (mention, index, self) =>
        index ===
        self.findIndex((m) => Number(m.position) === Number(mention.position)),
    );
  for (const mention of sortedMentions) {
    if ("channel" in mention) continue;
    const label = `@${mention.user.username || mention.user.fid}`;
    parts.push(
      textBuffer.slice(Number(mention.position), index).toString("utf-8"),
    );
    parts.push(label);
    index = Number(mention.position);
  }
  parts.push(textBuffer.slice(0, index).toString("utf-8"));
  return parts.reverse().join("");
};
