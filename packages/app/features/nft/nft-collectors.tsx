"use client";

import {
  FetchNftCollectorsResponse,
  FetchNftFarcasterCollectorsResponse,
  GetNftCollectorsRequest,
  NftFarcasterCollector,
  NftOwner,
} from "@nook/common/types";
import {
  useNFtCollectors,
  useNFtFarcasterCollectors,
  useNFtFollowingCollectors,
} from "../../api/nft";
import { InfiniteFeed } from "../../components/infinite-feed";
import { Loading } from "../../components/loading";
import { CollectorItem, FarcasterCollectorItem } from "./nft-collector-item";

export const NftCollectors = ({
  req,
  initialData,
  asTabs,
  paddingTop,
  paddingBottom,
}: {
  req: GetNftCollectorsRequest;
  initialData?: FetchNftCollectorsResponse;
  asTabs?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
}) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useNFtCollectors(req, initialData);

  if (isLoading) {
    return <Loading />;
  }

  const collectors = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <InfiniteFeed
      data={collectors}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      asTabs={asTabs}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      renderItem={({ item }) => <CollectorItem collector={item as NftOwner} />}
    />
  );
};

export const NftFarcasterCollectors = ({
  req,
  initialData,
  asTabs,
  paddingTop,
  paddingBottom,
}: {
  req: GetNftCollectorsRequest;
  initialData?: FetchNftFarcasterCollectorsResponse;
  asTabs?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
}) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useNFtFarcasterCollectors(req, initialData);

  if (isLoading) {
    return <Loading />;
  }

  const collectors = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <InfiniteFeed
      data={collectors}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      asTabs={asTabs}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      renderItem={({ item }) => (
        <FarcasterCollectorItem collector={item as NftFarcasterCollector} />
      )}
    />
  );
};

export const NftFollowingCollectors = ({
  req,
  initialData,
  asTabs,
  paddingTop,
  paddingBottom,
}: {
  req: GetNftCollectorsRequest;
  initialData?: FetchNftFarcasterCollectorsResponse;
  asTabs?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
}) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useNFtFollowingCollectors(req, initialData);

  if (isLoading) {
    return <Loading />;
  }

  const collectors = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <InfiniteFeed
      data={collectors}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      asTabs={asTabs}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      renderItem={({ item }) => (
        <FarcasterCollectorItem collector={item as NftFarcasterCollector} />
      )}
    />
  );
};
