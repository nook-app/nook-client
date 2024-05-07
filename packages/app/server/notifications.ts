"use server";

import { makeRequest } from "../api/utils";
import {
  FetchNotificationsResponse,
  GetNotificationsRequest,
} from "@nook/common/types";

export const markNotificationsRead = async () => {
  return await makeRequest("/notifications/mark-read", {
    method: "POST",
  });
};

export const fetchNotifications = async (
  req: GetNotificationsRequest,
  cursor?: string,
): Promise<FetchNotificationsResponse> => {
  return makeRequest(`/notifications${cursor ? `?cursor=${cursor}` : ""}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
};
