"use client";

import {
  FetchNftEventsResponse,
  GetNftCollectionEventsRequest,
  GetNftEventsRequest,
  NftEvent,
} from "@nook/common/types";
import { useNftCollectionEvents, useNftEvents } from "../../api/nft";
import { NftInfiniteFeed } from "./infinite-feed";
import { Loading } from "../../components/loading";
import { NftEventItem } from "./nft-event-item";

export const NftEvents = ({
  req,
  initialData,
  asTabs,
  paddingTop,
  paddingBottom,
}: {
  req: GetNftEventsRequest;
  initialData?: FetchNftEventsResponse;
  asTabs?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
}) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useNftEvents(req, initialData);

  if (isLoading) {
    return <Loading />;
  }

  const events = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <NftInfiniteFeed
      data={events}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      asTabs={asTabs}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      renderItem={({ item }) => <NftEventItem event={item as NftEvent} />}
    />
  );
};

export const NftCollectionEvents = ({
  req,
  initialData,
  asTabs,
  paddingTop,
  paddingBottom,
}: {
  req: GetNftCollectionEventsRequest;
  initialData?: FetchNftEventsResponse;
  asTabs?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
}) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useNftCollectionEvents(req, initialData);

  if (isLoading) {
    return <Loading />;
  }

  const events = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <NftInfiniteFeed
      data={events}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      asTabs={asTabs}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      renderItem={({ item }) => <NftEventItem event={item as NftEvent} />}
    />
  );
};
