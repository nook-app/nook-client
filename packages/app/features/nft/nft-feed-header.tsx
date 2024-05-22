"use client";

import { NftFeedDisplay, NftFeedOrderBy } from "@nook/common/types";
import { memo } from "react";
import { Button, XStack } from "@nook/app-ui";
import { NftSortMenu } from "./nft-sort-menu";

export const NftFeedHeader = memo(
  ({
    sort,
    onSortChange,
    display,
    onDisplayChange,
  }: {
    sort: NftFeedOrderBy;
    onSortChange: (value: NftFeedOrderBy) => void;
    display: NftFeedDisplay;
    onDisplayChange: (value: NftFeedDisplay) => void;
  }) => {
    const options = [
      { label: "Most Recent", value: "transfer_time__desc" },
      { label: "Alphabetical", value: "name__asc" },
    ];

    if (display === "tokens") {
      options.push({ label: "Floor Price", value: "floor_price__desc" });
    }

    return (
      <XStack
        alignItems="center"
        justifyContent="space-between"
        marginVertical="$1.5"
        marginTop="$2.5"
        marginHorizontal="$1.5"
      >
        <Button
          borderWidth="$0"
          backgroundColor="$color4"
          borderRadius="$10"
          height="$3"
          minHeight="$3"
          padding="$0"
          paddingHorizontal="$3"
          onPress={() => {
            onDisplayChange(display === "tokens" ? "collections" : "tokens");
          }}
        >
          {display === "tokens" ? "Items" : "Collections"}
        </Button>
        <NftSortMenu
          options={options}
          value={sort}
          onChange={(v) => {
            setTimeout(() => {
              onSortChange(v as NftFeedOrderBy);
            }, 100);
          }}
        />
      </XStack>
    );
  },
);
