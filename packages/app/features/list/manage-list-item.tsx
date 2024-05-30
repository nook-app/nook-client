import { Channel, FarcasterUserV1, List, ListType } from "@nook/common/types";
import { AnimatePresence, NookText, View, XStack, YStack } from "@nook/app-ui";
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
  }: { list: List; user?: FarcasterUserV1; channel?: Channel }) => {
    const listStore = useListStore((state) => state.lists[list.id]);
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
          animation="100ms"
          opacity={1}
          scale={1}
          y={0}
        >
          {user ? (
            <ManageUser list={listStore} user={user} />
          ) : channel ? (
            <ManageChannel list={listStore} channel={channel} />
          ) : null}
        </View>
      </AnimatePresence>
    );
  },
);

const ManageUser = ({ list, user }: { list: List; user: FarcasterUserV1 }) => {
  const { addUser, removeUser, isAdded } = useAddUserToList(list, user);

  return (
    <XStack
      gap="$2.5"
      justifyContent="space-between"
      alignItems="center"
      onPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isAdded) {
          removeUser();
        } else {
          addUser();
        }
      }}
      cursor="pointer"
      padding="$2.5"
      hoverStyle={{
        transform: "all 0.2s ease-in-out",
        backgroundColor: "$color2",
      }}
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
    list,
    channel,
  );

  return (
    <XStack
      gap="$2.5"
      justifyContent="space-between"
      alignItems="center"
      onPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isAdded) {
          removeChannel();
        } else {
          addChannel();
        }
      }}
      cursor="pointer"
      padding="$2.5"
      hoverStyle={{
        transform: "all 0.2s ease-in-out",
        backgroundColor: "$color2",
      }}
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
  return (
    <XStack gap="$2.5" alignItems="center" flexShrink={1} flexGrow={1}>
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
              <NookText muted>{`${formatNumber(list.itemCount || 0)} ${
                list.type === ListType.USERS ? "user" : "channel"
              }${list.itemCount === 1 ? "" : "s"}`}</NookText>
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
