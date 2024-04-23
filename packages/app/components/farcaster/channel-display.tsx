import { NookText, View, XStack, YStack } from "@nook/ui";
import { Channel } from "../../types";
import { Link } from "solito/link";
import { CdnAvatar } from "../cdn-avatar";

export const FarcasterChannelTextDisplay = ({
  channel,
  orientation = "horizontal",
  asLink,
}: {
  channel: Channel;
  orientation?: "horizontal" | "vertical";
  asLink?: boolean;
}) => {
  const Stack = orientation === "horizontal" ? XStack : YStack;
  const Component = (
    <Stack gap={orientation === "horizontal" ? "$1.5" : "$1"} flexShrink={1}>
      <XStack gap="$1.5" alignItems="center" flexShrink={1}>
        <NookText
          fontWeight="600"
          flexShrink={1}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {`${channel.name} `}
        </NookText>
      </XStack>
      <NookText muted flexShrink={1} numberOfLines={1}>
        {`/${channel.channelId}`}
      </NookText>
    </Stack>
  );

  if (asLink) {
    return (
      <View
        onPress={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Link href={`/channels/${channel.channelId}`}>{Component}</Link>
      </View>
    );
  }

  return Component;
};

export const FarcasterChannelDisplay = ({
  channel,
  asLink,
}: { channel: Channel; asLink?: boolean }) => (
  <XStack gap="$2.5" alignItems="center" flex={1}>
    <FarcasterChannelAvatar channel={channel} size="$4" asLink={asLink} />
    <FarcasterChannelTextDisplay
      channel={channel}
      orientation="vertical"
      asLink={asLink}
    />
  </XStack>
);

export const FarcasterChannelAvatar = ({
  channel,
  size,
  asLink,
}: { channel: Channel; size: string; asLink?: boolean }) => {
  const Component = <CdnAvatar src={channel.imageUrl} size={size} />;

  if (asLink) {
    return (
      <View
        onPress={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Link href={`/channels/${channel.channelId}`}>{Component}</Link>
      </View>
    );
  }

  return Component;
};

export const FarcasterChannelBadge = ({
  channel,
  asLink,
}: { channel: Channel; asLink?: boolean }) => {
  const Component = (
    <XStack
      gap="$1.5"
      alignItems="center"
      flexShrink={1}
      backgroundColor="$color3"
      borderRadius="$6"
      paddingHorizontal="$2"
      paddingVertical="$1.5"
      borderColor="$color7"
      borderWidth="$0.5"
      hoverStyle={{
        // @ts-ignore
        transition: "all 0.2s ease-in-out",
        backgroundColor: "$color4",
      }}
    >
      <CdnAvatar src={channel.imageUrl} size="$0.9" />
      <View flexShrink={1}>
        <NookText
          numberOfLines={1}
          ellipsizeMode="tail"
          fontWeight="500"
          fontSize="$3"
        >
          {`/${channel.channelId}`}
        </NookText>
      </View>
    </XStack>
  );

  if (asLink) {
    return (
      <View
        onPress={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Link href={`/channels/${channel.channelId}`}>{Component}</Link>
      </View>
    );
  }

  return Component;
};
