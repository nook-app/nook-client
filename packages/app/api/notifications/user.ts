import { makeRequest } from "../utils";
import { useQuery } from "@tanstack/react-query";

export const fetchNotificationsCount = async () => {
  return await makeRequest("/notifications/count");
};

export const useNotificationsCount = (enabled: boolean) => {
  return useQuery({
    queryKey: ["notifications-count"],
    queryFn: fetchNotificationsCount,
    enabled,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const markNotificationsRead = async () => {
  return await makeRequest("/notifications/mark-read", {
    method: "POST",
  });
};
