import { getServerSession } from "../../server/actions";
import { FarcasterUser } from "../../types";
import { makeRequest } from "../utils";
import {
  useQuery,
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";

type FarcasterUsersResponse = {
  data: FarcasterUser[];
  nextCursor?: string;
};

export const fetchUser = async (username: string): Promise<FarcasterUser> => {
  return await makeRequest(`/farcaster/users/${username}`);
};

export const useUser = (username: string) => {
  const queryClient = useQueryClient();
  const initialData = queryClient.getQueryData<FarcasterUser>([
    "user",
    username,
  ]);
  return useQuery<FarcasterUser>({
    queryKey: ["user", username],
    queryFn: async () => {
      const user = await fetchUser(username);
      queryClient.setQueryData(["user", username], user);
      queryClient.setQueryData(["users", user.fid], user);
      return user;
    },
    initialData,
    enabled: !initialData && !!username,
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
        queryClient.setQueryData(["user", user.username], user);
      }
      return users;
    },
    enabled: fids.length > 0,
  });
};

export const fetchUserFollowers = async (username: string, cursor?: string) => {
  return await makeRequest(
    `/farcaster/users/${username}/followers${
      cursor ? `?cursor=${cursor}` : ""
    }`,
  );
};

export const useUserFollowers = (username: string) => {
  const queryClient = useQueryClient();
  return useInfiniteQuery<
    FarcasterUsersResponse,
    unknown,
    InfiniteData<FarcasterUsersResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["user-followers", username],
    queryFn: async ({ pageParam }) => {
      const data = await fetchUserFollowers(username, pageParam);
      for (const user of data.data) {
        queryClient.setQueryData(["user", user.username], user);
      }
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });
};

export const fetchUserFollowing = async (username: string, cursor?: string) => {
  return await makeRequest(
    `/farcaster/users/${username}/following${
      cursor ? `?cursor=${cursor}` : ""
    }`,
  );
};

export const useUserFollowing = (username: string) => {
  const queryClient = useQueryClient();
  return useInfiniteQuery<
    FarcasterUsersResponse,
    unknown,
    InfiniteData<FarcasterUsersResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["user-following", username],
    queryFn: async ({ pageParam }) => {
      const data = await fetchUserFollowing(username, pageParam);
      for (const user of data.data) {
        queryClient.setQueryData(["user", user.username], user);
      }
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });
};

export const fetchUserMutuals = async (username: string, cursor?: string) => {
  return await makeRequest(
    `/farcaster/users/${username}/mutuals${cursor ? `?cursor=${cursor}` : ""}`,
  );
};

export const useUserMutuals = (username: string) => {
  const queryClient = useQueryClient();
  return useInfiniteQuery<
    FarcasterUsersResponse,
    unknown,
    InfiniteData<FarcasterUsersResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["user-mutuals", username],
    queryFn: async ({ pageParam }) => {
      const data = await fetchUserMutuals(username, pageParam);
      for (const user of data.data) {
        queryClient.setQueryData(["user", user.username], user);
      }
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });
};
