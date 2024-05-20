import { makeRequest } from "../utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const fetchNotificationsCount = async (): Promise<{ count: number }> => {
  return await makeRequest("/notifications/count");
};

export const useNotificationsCount = (fid?: string) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["notifications-count"],
    queryFn: async () => {
      const data = await fetchNotificationsCount();
      if (data.count > 0 && fid) {
        queryClient.invalidateQueries({
          queryKey: ["notifications-priority", fid],
        });
      }
      return data;
    },
    enabled: !!fid,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const markNotificationsRead = async () => {
  return await makeRequest("/notifications/mark-read", {
    method: "POST",
  });
};
