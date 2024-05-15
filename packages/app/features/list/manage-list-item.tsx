import { Channel, FarcasterUser, List, ListType } from "@nook/common/types";
import {
  AnimatePresence,
  Button,
  NookText,
  View,
  XStack,
  YStack,
} from "@nook/app-ui";
import { memo } from "react";
import { GradientIcon } from "../../components/gradient-icon";
import { formatNumber } from "../../utils";
import { CdnAvatar } from "../../components/cdn-avatar";
import { useListStore } from "../../store/useListStore";
import { useAddUserToList } from "../../hooks/useAddUserToList";
import { Check } from "@tamagui/lucide-icons";
import { useAddChannelToList } from "../../hooks/useAddChannelToList";

export const ManageListItem = memo(
  ({
    list,
    user,
    channel,
  }: { list: List; user?: FarcasterUser; channel?: Channel }) => {
    const deletedLists = useListStore((state) => state.deletedLists);
    if (deletedLists[list.id]) return null;

    return (
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
          {user ? (
            <ManageUser list={list} user={user} />
          ) : channel ? (
            <ManageChannel list={list} channel={channel} />
          ) : null}
        </View>
      </AnimatePresence>
    );
  },
);

const ManageUser = ({ list, user }: { list: List; user: FarcasterUser }) => {
  const { addUser, removeUser, isAdded } = useAddUserToList(list.id, user);

  return (
    <XStack
      padding="$2.5"
      gap="$2.5"
      justifyContent="space-between"
      alignItems="center"
      onPress={isAdded ? removeUser : addUser}
    >
      <Overview list={list} />
      {isAdded && (
        <View backgroundColor="$color8" borderRadius="$12" padding="$1.5">
          <Check size={10} strokeWidth={4} color="$color12" />
        </View>
      )}
    </XStack>
  );
};

const ManageChannel = ({ list, channel }: { list: List; channel: Channel }) => {
  const { addChannel, removeChannel, isAdded } = useAddChannelToList(
    list.id,
    channel,
  );

  return (
    <XStack
      padding="$2.5"
      gap="$2.5"
      justifyContent="space-between"
      alignItems="center"
      onPress={isAdded ? removeChannel : addChannel}
    >
      <Overview list={list} />
      {isAdded && (
        <View backgroundColor="$color8" borderRadius="$12" padding="$1.5">
          <Check size={10} strokeWidth={4} color="white" />
        </View>
      )}
    </XStack>
  );
};

const Overview = ({ list }: { list: List }) => {
  const itemCount = useListStore((state) => state.lists[list.id]?.itemCount);
  return (
    <XStack
      gap="$2.5"
      hoverStyle={{
        transform: "all 0.2s ease-in-out",
        backgroundColor: "$color2",
      }}
      alignItems="center"
      flexShrink={1}
    >
      {list.imageUrl && <CdnAvatar src={list.imageUrl} size="$5" />}
      {!list.imageUrl && (
        <GradientIcon label={list.name} size="$5" borderRadius="$10">
          <NookText textTransform="uppercase" fontWeight="700" fontSize="$8">
            {list.name.slice(0, 1)}
          </NookText>
        </GradientIcon>
      )}
      <YStack flexShrink={1} flexGrow={1} gap="$1">
        <XStack justifyContent="space-between" gap="$2">
          <YStack flexShrink={1}>
            <NookText variant="label" fontSize="$6">
              {list.name}
            </NookText>
            <XStack gap="$2">
              <NookText muted>{`${formatNumber(itemCount || 0)} ${
                list.type === ListType.USERS ? "user" : "channel"
              }${itemCount === 1 ? "" : "s"}`}</NookText>
            </XStack>
          </YStack>
        </XStack>
        {list.description && (
          <NookText numberOfLines={1}>{list.description}</NookText>
        )}
      </YStack>
    </XStack>
  );
};
