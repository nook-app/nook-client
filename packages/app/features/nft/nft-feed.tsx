"use client";

import {
  FetchNftsResponse,
  NftFeedDisplay,
  NftFeedFilter,
  NftFeedOrderBy,
  SimpleHashCollection,
  SimpleHashNFT,
  SimplehashNftCollection,
} from "@nook/common/types";
import { memo, useCallback, useState } from "react";
import {
  useCollectionNfts,
  useNftCollectionCreatedFeed,
  useNftCollectionFeed,
  useNftCreatedFeed,
  useNftFeed,
} from "../../api/nft";
import { Loading } from "../../components/loading";
import { InfiniteFeed } from "../../components/infinite-feed";
import { NftFeedHeader } from "./nft-feed-header";
import { NftDisplay } from "./nft-display";
import {
  NftCollectionDisplay,
  NftCreatedCollectionDisplay,
} from "./nft-collection-display";

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
  const [created, setCreated] = useState(false);

  if (display === "tokens") {
    if (created) {
      return (
        <NftCreatedFeedComponent
          filter={filter}
          asTabs={asTabs}
          paddingTop={paddingTop}
          paddingBottom={paddingBottom}
          setDisplay={setDisplay}
          setCreated={setCreated}
        />
      );
    }

    return (
      <NftFeedComponent
        filter={filter}
        initialData={initialData}
        asTabs={asTabs}
        paddingTop={paddingTop}
        paddingBottom={paddingBottom}
        setDisplay={setDisplay}
        setCreated={setCreated}
      />
    );
  }

  if (created) {
    return (
      <NftCollectionCreatedFeedComponent
        filter={filter}
        asTabs={asTabs}
        paddingTop={paddingTop}
        paddingBottom={paddingBottom}
        setDisplay={setDisplay}
        setCreated={setCreated}
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
      setCreated={setCreated}
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
    setCreated,
  }: {
    filter: NftFeedFilter;
    initialData?: FetchNftsResponse;
    asTabs?: boolean;
    paddingTop?: number;
    paddingBottom?: number;
    setDisplay: (value: NftFeedDisplay) => void;
    setCreated: (value: boolean) => void;
  }) => {
    const defaultSort = filter.orderBy || "transfer_time__desc";
    const [orderBy, setOrderBy] = useState<NftFeedOrderBy>(defaultSort);
    const {
      data,
      isLoading,
      refresh,
      isRefetching,
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

    return (
      <InfiniteFeed
        data={nfts}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        refetch={refresh}
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
            created={false}
            onCreatedChange={setCreated}
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
    setCreated,
  }: {
    filter: NftFeedFilter;
    asTabs?: boolean;
    paddingTop?: number;
    paddingBottom?: number;
    setDisplay: (value: NftFeedDisplay) => void;
    setCreated: (value: boolean) => void;
  }) => {
    const defaultSort = filter.orderBy || "transfer_time__desc";
    const [orderBy, setOrderBy] = useState<NftFeedOrderBy>(defaultSort);
    const {
      data,
      isLoading,
      refresh,
      isRefetching,
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

    return (
      <InfiniteFeed
        data={nfts}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        refetch={refresh}
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
            created={false}
            onCreatedChange={setCreated}
          />
        }
        renderItem={({ item }) => (
          <NftCollectionDisplay collection={item as SimplehashNftCollection} />
        )}
      />
    );
  },
);

const NftCreatedFeedComponent = memo(
  ({
    filter,
    asTabs,
    paddingTop,
    paddingBottom,
    setDisplay,
    setCreated,
  }: {
    filter: NftFeedFilter;
    asTabs?: boolean;
    paddingTop?: number;
    paddingBottom?: number;
    setDisplay: (value: NftFeedDisplay) => void;
    setCreated: (value: boolean) => void;
  }) => {
    const {
      data,
      isLoading,
      refresh,
      isRefetching,
      fetchNextPage,
      isFetchingNextPage,
      hasNextPage,
    } = useNftCreatedFeed(filter);

    const nfts = data?.pages.flatMap((page) => page.data) ?? [];

    if (isLoading) {
      return <Loading />;
    }

    return (
      <InfiniteFeed
        data={nfts}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        refetch={refresh}
        isRefetching={isRefetching}
        paddingTop={paddingTop}
        paddingBottom={paddingBottom}
        asTabs={asTabs}
        ListHeaderComponent={
          <NftFeedHeader
            display="tokens"
            onDisplayChange={setDisplay}
            created
            onCreatedChange={setCreated}
          />
        }
        renderItem={({ item }) => <NftDisplay nft={item as SimpleHashNFT} />}
        numColumns={3}
      />
    );
  },
);

const NftCollectionCreatedFeedComponent = memo(
  ({
    filter,
    asTabs,
    paddingTop,
    paddingBottom,
    setDisplay,
    setCreated,
  }: {
    filter: NftFeedFilter;
    asTabs?: boolean;
    paddingTop?: number;
    paddingBottom?: number;
    setDisplay: (value: NftFeedDisplay) => void;
    setCreated: (value: boolean) => void;
  }) => {
    const {
      data,
      isLoading,
      refresh,
      isRefetching,
      fetchNextPage,
      isFetchingNextPage,
      hasNextPage,
    } = useNftCollectionCreatedFeed(filter);

    const nfts = data?.pages.flatMap((page) => page.data) ?? [];

    if (isLoading) {
      return <Loading />;
    }

    return (
      <InfiniteFeed
        data={nfts}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        refetch={refresh}
        isRefetching={isRefetching}
        paddingTop={paddingTop}
        paddingBottom={paddingBottom}
        asTabs={asTabs}
        ListHeaderComponent={
          <NftFeedHeader
            display="collections"
            onDisplayChange={setDisplay}
            created
            onCreatedChange={setCreated}
          />
        }
        renderItem={({ item }) => (
          <NftCreatedCollectionDisplay
            collection={item as SimpleHashCollection}
          />
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
    <InfiniteFeed
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
