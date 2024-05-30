import { FarcasterUserV1, FetchUsersResponse } from "@nook/common/types";
import {
  useQuery,
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { useUserStore } from "../../store/useUserStore";
import { useState } from "react";
import {
  fetchUser,
  fetchUserFollowers,
  fetchUserFollowing,
  fetchUserMutuals,
  fetchUsers,
  fetchUsersByAddress,
  searchUsers,
} from "../../api/farcaster";

export const useUser = (username: string, fid?: boolean) => {
  const addUsers = useUserStore((state) => state.addUsers);
  return useQuery<FarcasterUserV1>({
    queryKey: ["user", username],
    queryFn: async () => {
      const user = await fetchUser(username, fid);
      addUsers([user]);
      return user;
    },
    enabled: !!username,
  });
};

export const useUsers = (fids: string[]) => {
  const addUsers = useUserStore((state) => state.addUsers);
  const queryClient = useQueryClient();
  const initialData = queryClient.getQueryData<FetchUsersResponse>([
    "users",
    fids.join(","),
  ]);
  return useQuery<FetchUsersResponse>({
    queryKey: ["users", fids.join(",")],
    queryFn: async () => {
      const users = await fetchUsers(fids);
      addUsers(users.data);
      return users;
    },
    enabled: fids.length > 0 && !initialData,
    initialData,
  });
};

export const useUsersByAddress = (addresses: string[]) => {
  const addUsers = useUserStore((state) => state.addUsers);
  const queryClient = useQueryClient();
  const initialData = queryClient.getQueryData<FetchUsersResponse>([
    "users",
    addresses.join(","),
  ]);
  return useQuery<FetchUsersResponse>({
    queryKey: ["users", addresses.join(",")],
    queryFn: async () => {
      const users = await fetchUsersByAddress(addresses);
      addUsers(users.data);
      return users;
    },
    enabled: addresses.length > 0 && !initialData,
    initialData,
  });
};

export const useUserFollowers = (
  fid: string,
  initialData?: FetchUsersResponse,
) => {
  const addUsers = useUserStore((state) => state.addUsers);
  return useInfiniteQuery<
    FetchUsersResponse,
    unknown,
    InfiniteData<FetchUsersResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["user-followers", fid],
    queryFn: async ({ pageParam }) => {
      const data = await fetchUserFollowers(fid, pageParam);
      addUsers(data.data);
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

export const useUserFollowing = (
  fid: string,
  initialData?: FetchUsersResponse,
) => {
  const addUsers = useUserStore((state) => state.addUsers);
  return useInfiniteQuery<
    FetchUsersResponse,
    unknown,
    InfiniteData<FetchUsersResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["user-following", fid],
    queryFn: async ({ pageParam }) => {
      const data = await fetchUserFollowing(fid, pageParam);
      addUsers(data.data);
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

export const useUserMutuals = (
  fid: string,
  initialData?: FetchUsersResponse,
) => {
  const addUsers = useUserStore((state) => state.addUsers);
  return useInfiniteQuery<
    FetchUsersResponse,
    unknown,
    InfiniteData<FetchUsersResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["user-mutuals", fid],
    queryFn: async ({ pageParam }) => {
      const data = await fetchUserMutuals(fid, pageParam);
      addUsers(data.data);
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

export const useSearchUsers = (
  query: string,
  limit?: number,
  initialData?: FetchUsersResponse,
): UseInfiniteQueryResult<InfiniteData<FetchUsersResponse>, unknown> & {
  refresh: () => Promise<void>;
} => {
  const [isRefetching, setIsRefetching] = useState(false);
  const queryClient = useQueryClient();

  const addUsers = useUserStore((state) => state.addUsers);

  const queryKey = ["users", "search", limit?.toString() || "", query];

  const props = useInfiniteQuery<
    FetchUsersResponse,
    unknown,
    InfiniteData<FetchUsersResponse>,
    string[],
    string | undefined
  >({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const data = await searchUsers(query, pageParam, limit);
      addUsers(data.data);
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

  const refresh = async () => {
    setIsRefetching(true);
    queryClient.setQueryData<InfiniteData<FetchUsersResponse>>(
      queryKey,
      (data) => {
        if (!data) return undefined;
        return {
          pages: data.pages.slice(0, 1),
          pageParams: data.pageParams.slice(0, 1),
        };
      },
    );
    await props.refetch();
    setIsRefetching(false);
  };

  return { ...props, refresh, isRefetching };
};
