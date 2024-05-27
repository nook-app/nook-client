"use client";

import { NftFeedDisplay, NftFeedOrderBy } from "@nook/common/types";
import { memo } from "react";
import { Button, XStack } from "@nook/app-ui";
import { Grid3x3, List } from "@tamagui/lucide-icons";
import { Dropdown } from "../../components/dropdown";
import { haptics } from "../../utils/haptics";

export const NftFeedHeader = memo(
  ({
    sort,
    onSortChange,
    display,
    onDisplayChange,
    created,
    onCreatedChange,
  }: {
    sort?: NftFeedOrderBy;
    onSortChange?: (value: NftFeedOrderBy) => void;
    display: NftFeedDisplay;
    onDisplayChange: (value: NftFeedDisplay) => void;
    created: boolean;
    onCreatedChange: (value: boolean) => void;
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
        gap="$1.5"
      >
        <XStack gap="$1.5">
          <Button
            icon={display === "tokens" ? Grid3x3 : List}
            width="$2.5"
            height="$2.5"
            padding="$0"
            borderRadius="$10"
            scaleIcon={1.25}
            color="white"
            onPress={() => {
              onDisplayChange(display === "tokens" ? "collections" : "tokens");
              haptics.selection();
            }}
          />
          <Button
            borderWidth="$0"
            backgroundColor="$color4"
            borderRadius="$10"
            height="$2.5"
            minHeight="$2.5"
            padding="$0"
            paddingHorizontal="$3"
            onPress={() => {
              onCreatedChange(!created);
              haptics.selection();
            }}
          >
            {created ? "Created" : "Collected"}
          </Button>
        </XStack>
        {sort && onSortChange && (
          <Dropdown
            label="Sort Collectibles"
            options={options}
            value={sort}
            onChange={(v) => {
              setTimeout(() => {
                onSortChange(v as NftFeedOrderBy);
                haptics.selection();
              }, 100);
            }}
          />
        )}
      </XStack>
    );
  },
);
