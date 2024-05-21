"use client";

import { SimpleHashNFT } from "@nook/common/types";
import { Separator, Spinner, View } from "@nook/app-ui";
import { InfiniteScrollList } from "../../components/infinite-scroll-list";
import { NftDisplay } from "./nft-display.native";

export const NftInfiniteFeed = ({
  nfts,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
  ListHeaderComponent,
  refetch,
  isRefetching,
  paddingTop,
  paddingBottom,
  asTabs,
}: {
  nfts: SimpleHashNFT[];
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  ListHeaderComponent?: JSX.Element;
  refetch: () => Promise<void>;
  isRefetching: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  asTabs?: boolean;
}) => {
  return (
    <InfiniteScrollList
      data={nfts}
      renderItem={({ item }) => <NftDisplay nft={item as SimpleHashNFT} />}
      onEndReached={fetchNextPage}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View marginVertical="$3">
            <Spinner />
          </View>
        ) : null
      }
      ItemSeparatorComponent={() => (
        <Separator width="100%" borderBottomColor="$borderColorBg" />
      )}
      ListHeaderComponent={ListHeaderComponent}
      numColumns={3}
    />
  );
};
