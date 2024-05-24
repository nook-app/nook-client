"use client";

import {
  FetchNftCollectorsResponse,
  FetchNftFarcasterCollectorsResponse,
  GetNftCollectionCollectorsRequest,
  NftFarcasterCollector,
  NftOwner,
} from "@nook/common/types";
import {
  useNFtCollectionCollectors,
  useNFtCollectionFarcasterCollectors,
  useNFtCollectionFollowingCollectors,
} from "../../api/nft";
import { InfiniteFeed } from "../../components/infinite-feed";
import { Loading } from "../../components/loading";
import { CollectorItem, FarcasterCollectorItem } from "./nft-collector-item";

export const NftCollectionCollectors = ({
  req,
  initialData,
  asTabs,
  paddingTop,
  paddingBottom,
}: {
  req: GetNftCollectionCollectorsRequest;
  initialData?: FetchNftCollectorsResponse;
  asTabs?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
}) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useNFtCollectionCollectors(req, initialData);

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

export const NftCollectionFarcasterCollectors = ({
  req,
  initialData,
  asTabs,
  paddingTop,
  paddingBottom,
}: {
  req: GetNftCollectionCollectorsRequest;
  initialData?: FetchNftFarcasterCollectorsResponse;
  asTabs?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
}) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useNFtCollectionFarcasterCollectors(req, initialData);

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

export const NftCollectionFollowingCollectors = ({
  req,
  initialData,
  asTabs,
  paddingTop,
  paddingBottom,
}: {
  req: GetNftCollectionCollectorsRequest;
  initialData?: FetchNftFarcasterCollectorsResponse;
  asTabs?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
}) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useNFtCollectionFollowingCollectors(req, initialData);

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
