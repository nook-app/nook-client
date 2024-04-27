import { useAuth } from "../../context/auth";
import { makeRequest } from "../utils";
import { useQuery } from "@tanstack/react-query";

export const fetchNotificationsCount = async () => {
  return await makeRequest("/notifications/count");
};

export const useNotificationsCount = () => {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["notifications-count"],
    queryFn: fetchNotificationsCount,
    enabled: !!session?.fid,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: false,
  });
};
