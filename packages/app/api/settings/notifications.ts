import { NotificationPreferences } from "@nook/common/types";
import { makeRequest } from "../utils";

export const createNotificationUser = async (token: string) => {
  return await makeRequest("/notifications/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });
};

export const deleteNotificationsUser = async () => {
  return await makeRequest("/notifications/user", {
    method: "DELETE",
  });
};

export const updateNotificationPreferences = async (
  preferences: NotificationPreferences,
) => {
  return await makeRequest("/notifications/user", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preferences),
  });
};
