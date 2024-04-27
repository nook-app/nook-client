import { FarcasterUser, FetchUsersResponse } from "../../types";
import { makeRequest } from "../utils";
import {
  useQuery,
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const fetchUser = async (username: string): Promise<FarcasterUser> => {
  return await makeRequest(`/farcaster/users/${username}`);
};

export const useUser = (username: string) => {
  const queryClient = useQueryClient();
  return useQuery<FarcasterUser>({
    queryKey: ["user", username],
    queryFn: async () => {
      const user = await fetchUser(username);
      queryClient.setQueryData(["user", username], user);
      queryClient.setQueryData(["users", user.fid], user);
      return user;
    },
    enabled: !!username,
  });
};

export const fetchUsers = async (
  fids: string[],
): Promise<FetchUsersResponse> => {
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
  return useQuery<FetchUsersResponse>({
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

export const useUserFollowers = (
  username: string,
  initialData?: FetchUsersResponse,
) => {
  const queryClient = useQueryClient();
  return useInfiniteQuery<
    FetchUsersResponse,
    unknown,
    InfiniteData<FetchUsersResponse>,
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
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [undefined],
        }
      : undefined,
    initialPageParam: initialData?.nextCursor,
  });
};

export const fetchUserFollowing = async (username: string, cursor?: string) => {
  return await makeRequest(
    `/farcaster/users/${username}/following${
      cursor ? `?cursor=${cursor}` : ""
    }`,
  );
};

export const useUserFollowing = (
  username: string,
  initialData?: FetchUsersResponse,
) => {
  const queryClient = useQueryClient();
  return useInfiniteQuery<
    FetchUsersResponse,
    unknown,
    InfiniteData<FetchUsersResponse>,
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
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [undefined],
        }
      : undefined,
    initialPageParam: initialData?.nextCursor,
  });
};

export const fetchUserMutuals = async (username: string, cursor?: string) => {
  return await makeRequest(
    `/farcaster/users/${username}/mutuals${cursor ? `?cursor=${cursor}` : ""}`,
  );
};

export const useUserMutuals = (
  username: string,
  initialData?: FetchUsersResponse,
) => {
  const queryClient = useQueryClient();
  return useInfiniteQuery<
    FetchUsersResponse,
    unknown,
    InfiniteData<FetchUsersResponse>,
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
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [undefined],
        }
      : undefined,
    initialPageParam: initialData?.nextCursor,
  });
};

export const searchUsers = async (
  query: string,
  cursor?: string,
  limit?: number,
): Promise<FetchUsersResponse> => {
  return await makeRequest(
    `/farcaster/users?query=${query}${cursor ? `&cursor=${cursor}` : ""}${
      limit ? `&limit=${limit}` : ""
    }`,
  );
};

export const useSearchUsers = (
  query: string,
  limit?: number,
  initialData?: FetchUsersResponse,
) => {
  return useInfiniteQuery<
    FetchUsersResponse,
    unknown,
    InfiniteData<FetchUsersResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["users", "search", limit?.toString() || "", query],
    queryFn: async ({ pageParam }) => {
      const data = await searchUsers(query, pageParam, limit);
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [undefined],
        }
      : undefined,
    initialPageParam: initialData?.nextCursor,
    enabled: !!query,
  });
};
