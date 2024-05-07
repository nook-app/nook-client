"use client";

import {
  AnimatePresence,
  NookButton,
  NookText,
  Spinner,
  View,
  XStack,
  YStack,
} from "@nook/ui";
import { memo } from "react";
import { CastAction } from "@nook/common/types";
import { InfiniteScrollList } from "../../components/infinite-scroll-list";
import { darkenColor, stringToColor } from "../../utils";
import { GradientIcon } from "../../components/gradient-icon";
import { InstallActionDialog } from "../actions/install-dialog";

export const FarcasterActionsFeed = ({
  actions,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
}: {
  actions: CastAction[];
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
}) => {
  return (
    <InfiniteScrollList
      data={actions}
      renderItem={({ item }) => (
        <AnimatePresence>
          <View
            enterStyle={{
              opacity: 0,
            }}
            exitStyle={{
              opacity: 0,
            }}
            animation="quick"
            opacity={1}
            scale={1}
            y={0}
          >
            <FarcasterActionItem action={item as CastAction} />
          </View>
        </AnimatePresence>
      )}
      onEndReached={fetchNextPage}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View marginVertical="$3">
            <Spinner size="small" color="$color9" />
          </View>
        ) : null
      }
    />
  );
};

const FarcasterActionItem = memo(({ action }: { action: CastAction }) => {
  return (
    <XStack
      gap="$4"
      paddingHorizontal="$3.5"
      paddingVertical="$3"
      hoverStyle={{
        transform: "all 0.2s ease-in-out",
        backgroundColor: "$color2",
      }}
      flexShrink={1}
      borderBottomWidth="$0.5"
      borderBottomColor="$borderColorBg"
      justifyContent="space-between"
    >
      <XStack gap="$3" flexShrink={1}>
        <GradientIcon label={action.name} size="$5" icon={action.icon} />
        <YStack gap="$1" flexShrink={1}>
          <NookText variant="label">{action.name}</NookText>
          <NookText muted>{action.description}</NookText>
        </YStack>
      </XStack>
      <InstallActionDialog action={action}>
        <NookButton variant="action">Install</NookButton>
      </InstallActionDialog>
    </XStack>
  );
});
