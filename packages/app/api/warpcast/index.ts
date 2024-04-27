import { FetchCatActionsResponse } from "../../types";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

export const getFarcasterActions = async (
  cursor?: string,
): Promise<FetchCatActionsResponse> => {
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

export const useFarcasterActions = (initialData?: FetchCatActionsResponse) => {
  return useInfiniteQuery<
    FetchCatActionsResponse,
    unknown,
    InfiniteData<FetchCatActionsResponse>,
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
