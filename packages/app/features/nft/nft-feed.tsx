import {
  FetchNftsResponse,
  NftFeedFilter,
  NftFeedOrderBy,
} from "@nook/common/types";
import { memo, useCallback, useState } from "react";
import { useNftFeed } from "../../api/nft";
import { Loading } from "../../components/loading";
import { NftInfiniteFeed } from "./infinite-feed";
import { Button, XStack } from "@nook/app-ui";
import { Grid3x3 } from "@tamagui/lucide-icons";
import { NftSortMenu } from "./nft-sort-menu";

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
      nfts={nfts}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      refetch={handleRefresh}
      isRefetching={isRefetching}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      asTabs={asTabs}
      ListHeaderComponent={
        <NftFeedHeader value={orderBy} onChange={handleChange} />
      }
    />
  );
};

const NftFeedHeader = memo(
  ({
    value,
    onChange,
  }: {
    value: NftFeedOrderBy;
    onChange: (value: NftFeedOrderBy) => void;
  }) => {
    return (
      <XStack
        alignItems="center"
        justifyContent="space-between"
        marginVertical="$1.5"
        marginTop="$2"
        marginHorizontal="$1.5"
      >
        <Button
          icon={Grid3x3}
          width="$3"
          height="$3"
          padding="$0"
          borderRadius="$10"
          scaleIcon={1.25}
          color="white"
        />
        <NftSortMenu
          value={value}
          onChange={(v) => onChange(v as NftFeedOrderBy)}
        />
      </XStack>
    );
  },
);
