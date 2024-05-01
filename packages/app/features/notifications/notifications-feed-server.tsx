import { fetchNotifications } from "../../server/notifications";
import {
  NotificationsAllFeed,
  NotificationsMentionsFeed,
  NotificationsPriorityFeed,
} from "./notifications-tabs";

export const NotificationsPriorityFeedServer = async ({
  fid,
}: {
  fid: string;
}) => {
  const initialData = await fetchNotifications({ fid, priority: true });

  if (!initialData) {
    return <></>;
  }

  return <NotificationsPriorityFeed fid={fid} initialData={initialData} />;
};

export const NotificationsMentionsFeedServer = async ({
  fid,
}: {
  fid: string;
}) => {
  const initialData = await fetchNotifications({
    fid,
    types: ["MENTION", "QUOTE", "REPLY"],
  });

  if (!initialData) {
    return <></>;
  }

  return <NotificationsMentionsFeed fid={fid} initialData={initialData} />;
};

export const NotificationsAllFeedServer = async ({
  fid,
}: {
  fid: string;
}) => {
  const initialData = await fetchNotifications({ fid });

  if (!initialData) {
    return <></>;
  }

  return <NotificationsAllFeed fid={fid} initialData={initialData} />;
};
