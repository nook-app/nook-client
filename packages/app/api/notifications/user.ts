import { useAuth } from "../../context/auth";
import { makeRequest } from "../utils";
import { useQuery } from "@tanstack/react-query";

export const fetchNotificationsCount = async () => {
  return await makeRequest("/notifications/count");
};

export const useNotificationsCount = () => {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["notifications-count", session?.fid],
    queryFn: fetchNotificationsCount,
    enabled: !!session?.fid,
  });
};

export const markNotificationsRead = async () => {
  return await makeRequest("/notifications/mark-read", {
    method: "POST",
  });
};
