"use client";

import {
  FetchNftsResponse,
  NftFeedDisplay,
  NftFeedFilter,
  NftFeedOrderBy,
  SimpleHashNFT,
  SimplehashNftCollection,
} from "@nook/common/types";
import { memo, useCallback, useState } from "react";
import {
  useCollectionNfts,
  useNftCollectionFeed,
  useNftFeed,
} from "../../api/nft";
import { Loading } from "../../components/loading";
import { NftInfiniteFeed } from "./infinite-feed";
import { NftFeedHeader } from "./nft-feed-header";
import { NftDisplay } from "./nft-display";
import { NftCollectionDisplay } from "./nft-collection-display";

export const NftFeed = ({
  filter,
  initialData,
  asTabs,
  paddingTop,
  paddingBottom,
}: {
  filter: NftFeedFilter;
  initialData?: FetchNftsResponse;
  asTabs?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
}) => {
  const [display, setDisplay] = useState<NftFeedDisplay>("tokens");

  if (display === "tokens") {
    return (
      <NftFeedComponent
        filter={filter}
        initialData={initialData}
        asTabs={asTabs}
        paddingTop={paddingTop}
        paddingBottom={paddingBottom}
        setDisplay={setDisplay}
      />
    );
  }

  return (
    <NftCollectionFeedComponent
      filter={filter}
      asTabs={asTabs}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      setDisplay={setDisplay}
    />
  );
};

const NftFeedComponent = memo(
  ({
    filter,
    initialData,
    asTabs,
    paddingTop,
    paddingBottom,
    setDisplay,
  }: {
    filter: NftFeedFilter;
    initialData?: FetchNftsResponse;
    asTabs?: boolean;
    paddingTop?: number;
    paddingBottom?: number;
    setDisplay: (value: NftFeedDisplay) => void;
  }) => {
    const defaultSort = filter.orderBy || "transfer_time__desc";
    const [isRefetching, setIsRefetching] = useState(false);
    const [orderBy, setOrderBy] = useState<NftFeedOrderBy>(defaultSort);
    const {
      data,
      isLoading,
      refetch,
      fetchNextPage,
      isFetchingNextPage,
      hasNextPage,
    } = useNftFeed({ ...filter, orderBy }, initialData);

    const nfts = data?.pages.flatMap((page) => page.data) ?? [];

    const handleChange = useCallback(
      (value: NftFeedOrderBy) => setOrderBy(value),
      [],
    );

    if (isLoading) {
      return <Loading />;
    }

    const handleRefresh = async () => {
      setIsRefetching(true);
      await refetch();
      setIsRefetching(false);
    };

    return (
      <NftInfiniteFeed
        data={nfts}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        refetch={handleRefresh}
        isRefetching={isRefetching}
        paddingTop={paddingTop}
        paddingBottom={paddingBottom}
        asTabs={asTabs}
        ListHeaderComponent={
          <NftFeedHeader
            sort={orderBy}
            onSortChange={handleChange}
            display="tokens"
            onDisplayChange={setDisplay}
          />
        }
        renderItem={({ item }) => <NftDisplay nft={item as SimpleHashNFT} />}
        numColumns={3}
      />
    );
  },
);

const NftCollectionFeedComponent = memo(
  ({
    filter,
    asTabs,
    paddingTop,
    paddingBottom,
    setDisplay,
  }: {
    filter: NftFeedFilter;
    asTabs?: boolean;
    paddingTop?: number;
    paddingBottom?: number;
    setDisplay: (value: NftFeedDisplay) => void;
  }) => {
    const defaultSort = filter.orderBy || "transfer_time__desc";
    const [isRefetching, setIsRefetching] = useState(false);
    const [orderBy, setOrderBy] = useState<NftFeedOrderBy>(defaultSort);
    const {
      data,
      isLoading,
      refetch,
      fetchNextPage,
      isFetchingNextPage,
      hasNextPage,
    } = useNftCollectionFeed({ ...filter, orderBy });

    const nfts = data?.pages.flatMap((page) => page.data) ?? [];

    const handleChange = useCallback(
      (value: NftFeedOrderBy) => setOrderBy(value),
      [],
    );

    if (isLoading) {
      return <Loading />;
    }

    const handleRefresh = async () => {
      setIsRefetching(true);
      await refetch();
      setIsRefetching(false);
    };

    return (
      <NftInfiniteFeed
        data={nfts}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        refetch={handleRefresh}
        isRefetching={isRefetching}
        paddingTop={paddingTop}
        paddingBottom={paddingBottom}
        asTabs={asTabs}
        ListHeaderComponent={
          <NftFeedHeader
            sort={orderBy}
            onSortChange={handleChange}
            display="collections"
            onDisplayChange={setDisplay}
          />
        }
        renderItem={({ item }) => (
          <NftCollectionDisplay collection={item as SimplehashNftCollection} />
        )}
      />
    );
  },
);

export const CollectionNftsFeed = ({
  collectionId,
  initialData,
  asTabs,
  paddingTop,
  paddingBottom,
}: {
  collectionId: string;
  initialData?: FetchNftsResponse;
  asTabs?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
}) => {
  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useCollectionNfts(collectionId, initialData);

  const nfts = data?.pages.flatMap((page) => page.data) ?? [];

  if (isLoading) {
    return <Loading />;
  }

  return (
    <NftInfiniteFeed
      data={nfts}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      asTabs={asTabs}
      renderItem={({ item }) => <NftDisplay nft={item as SimpleHashNFT} />}
      numColumns={3}
    />
  );
};
