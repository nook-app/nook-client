import { makeRequest } from "../utils";

export const fetchNotificationsCount = async (): Promise<{ count: number }> => {
  return await makeRequest("/notifications/count");
};

export const markNotificationsRead = async () => {
  return await makeRequest("/notifications/mark-read", {
    method: "POST",
  });
};
