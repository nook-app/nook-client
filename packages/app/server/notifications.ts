"use server";

import { makeRequest } from "../api/utils";

export const markNotificationsRead = async () => {
  return await makeRequest("/notifications/mark-read", {
    method: "POST",
  });
};
