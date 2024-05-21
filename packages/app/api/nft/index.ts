import { FetchNftsResponse, NftFeedFilter } from "@nook/common/types";
import { makeRequest } from "../utils";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { useNftStore } from "../../store/useNftStore";

export const fetchNftFeed = async (
  filter: NftFeedFilter,
  cursor?: string,
): Promise<FetchNftsResponse> => {
  return await makeRequest("/v1/nfts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filter, cursor }),
  });
};

export const useNftFeed = (
  filter: NftFeedFilter,
  initialData?: FetchNftsResponse,
) => {
  const addNfts = useNftStore((state) => state.addNfts);
  return useInfiniteQuery<
    FetchNftsResponse,
    unknown,
    InfiniteData<FetchNftsResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["txFeed", JSON.stringify(filter)],
    queryFn: async ({ pageParam }) => {
      const data = await fetchNftFeed(filter, pageParam);
      addNfts(data.data);
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
    refetchOnWindowFocus: false,
  });
};
