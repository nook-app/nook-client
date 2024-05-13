import {
  FetchCastActionsResponse,
  FnameTransfer,
  SubmitFnameTransfer,
} from "@nook/common/types";
import {
  InfiniteData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { makeUrlRequest } from "../utils";

export const getFarcasterActions = async (
  cursor?: string,
): Promise<FetchCastActionsResponse> => {
  const response = await fetch(
    `https://api.warpcast.com/v2/discover-actions?list=top&limit=25${
      cursor ? `&cursor=${cursor}` : ""
    }`,
  );

  const data: {
    result: {
      actions: {
        name: string;
        icon: string;
        description: string;
        aboutUrl: string;
        actionUrl: string;
        action: {
          actionType: string;
          postUrl: string;
        };
      }[];
    };
    next: {
      cursor?: string;
    };
  } = await response.json();

  return {
    data: data.result.actions?.map((action) => ({
      name: action.name,
      icon: action.icon,
      description: action.description,
      aboutUrl: action.aboutUrl,
      actionType: action.action.actionType,
      postUrl: action.action.postUrl,
    })),
    nextCursor: data.next?.cursor,
  };
};

export const useFarcasterActions = (initialData?: FetchCastActionsResponse) => {
  return useInfiniteQuery<
    FetchCastActionsResponse,
    unknown,
    InfiniteData<FetchCastActionsResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["actions"],
    queryFn: async ({ pageParam }) => {
      const data = await getFarcasterActions(pageParam);
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

export const fetchCurrentFnameTransfer = async (fname: string) => {
  const response = await fetch(
    `https://fnames.farcaster.xyz/transfers/current?name=${fname}`,
  );

  if (!response.ok) {
    return;
  }

  const data: {
    transfer: FnameTransfer;
  } = await response.json();

  return data?.transfer;
};

export const fetchCurrentFnameTransferByFid = async (fid: string) => {
  const response = await fetch(
    `https://fnames.farcaster.xyz/transfers/current?fid=${fid}`,
  );

  if (!response.ok) {
    return;
  }

  const data: {
    transfer: FnameTransfer;
  } = await response.json();

  return data?.transfer;
};

export const submitFnameTransfer = async (transfer: SubmitFnameTransfer) => {
  const response = await fetch("https://fnames.farcaster.xyz/transfers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transfer),
  });

  if (!response.ok) {
    console.error(await response.text());
  }
};

export const fetchChannelFollowingStatus = async (
  fid: string,
  channelId: string,
): Promise<{ result: { following: boolean } }> => {
  return await makeUrlRequest(
    `https://api.warpcast.com/v1/user-channel?fid=${fid}&channelId=${channelId}`,
  );
};

export const useChannelFollowingStatus = (channelId: string, fid?: string) => {
  return useQuery({
    queryKey: ["channel-following", fid, channelId],
    queryFn: async () => {
      if (!fid) return;
      return await fetchChannelFollowingStatus(fid, channelId);
    },
    enabled: !!fid,
  });
};
