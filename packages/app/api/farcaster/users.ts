import { FarcasterUser } from "../../types";
import { makeRequest } from "../utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type FarcasterUsersResponse = {
  data: FarcasterUser[];
  nextCursor?: string;
};

export const fetchUser = async (fid: string): Promise<FarcasterUser> => {
  return await makeRequest(`/farcaster/users/${fid}`);
};

export const useUser = (fid: string) => {
  return useQuery<FarcasterUser>({
    queryKey: ["user", fid],
    queryFn: async () => {
      const user = await fetchUser(fid);
      return user;
    },
  });
};

export const fetchUsers = async (
  fids: string[],
): Promise<FarcasterUsersResponse> => {
  return await makeRequest("/farcaster/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fids }),
  });
};

export const useUsers = (fids: string[]) => {
  const queryClient = useQueryClient();
  return useQuery<FarcasterUsersResponse>({
    queryKey: ["users", fids.join(",")],
    queryFn: async () => {
      const users = await fetchUsers(fids);
      for (const user of users.data) {
        queryClient.setQueryData(["user", user.fid], user);
      }
      return users;
    },
    enabled: fids.length > 0,
  });
};
