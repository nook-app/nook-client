import { NookText, Text, View, XStack, YStack } from "@nook/app-ui";
import { Channel } from "@nook/common/types";
import { Link } from "solito/link";
import { CdnAvatar } from "../../cdn-avatar";
import { FarcasterBioText } from "../bio-text";
import { FarcasterChannelTooltip } from "./channel-tooltip";

export const FarcasterChannelTextDisplay = ({
  channel,
  orientation = "horizontal",
  asLink,
  asLabel,
  withBio,
}: {
  channel: Channel;
  orientation?: "horizontal" | "vertical";
  asLink?: boolean;
  asLabel?: boolean;
  withBio?: boolean;
}) => {
  const Stack = orientation === "horizontal" ? XStack : YStack;
  const bio = channel.description?.trim().replace(/\n\s*\n/g, "\n");
  const Component = (
    <YStack flexShrink={1} gap="$1">
      <Stack gap={orientation === "horizontal" ? "$1.5" : "$1"} flexShrink={1}>
        <XStack gap="$1.5" alignItems="center" flexShrink={1}>
          <NookText
            flexShrink={1}
            numberOfLines={1}
            ellipsizeMode="tail"
            variant={asLabel ? "label" : undefined}
            fontWeight={asLabel ? undefined : "600"}
          >
            {`${channel.name} `}
          </NookText>
        </XStack>
        <NookText muted flexShrink={1} numberOfLines={1}>
          {`/${channel.channelId}`}
        </NookText>
      </Stack>
      {withBio && bio && (
        <Text numberOfLines={2}>
          <FarcasterBioText text={bio} />
        </Text>
      )}
    </YStack>
  );

  if (asLink) {
    return (
      <FarcasterChannelTooltip channel={channel}>
        <View
          onPress={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Link href={`/channels/${channel.channelId}`}>{Component}</Link>
        </View>
      </FarcasterChannelTooltip>
    );
  }

  return Component;
};

export const FarcasterChannelDisplay = ({
  channel,
  asLink,
  asLabel,
  withBio,
}: {
  channel: Channel;
  asLink?: boolean;
  asLabel?: boolean;
  withBio?: boolean;
}) => (
  <XStack gap="$2.5" alignItems={withBio ? "flex-start" : "center"} flex={1}>
    <FarcasterChannelAvatar channel={channel} size="$4" asLink={asLink} />
    <FarcasterChannelTextDisplay
      channel={channel}
      orientation="vertical"
      asLink={asLink}
      asLabel={asLabel}
      withBio={withBio}
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
      <FarcasterChannelTooltip channel={channel}>
        <View
          onPress={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Link href={`/channels/${channel.channelId}`}>{Component}</Link>
        </View>
      </FarcasterChannelTooltip>
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
      backgroundColor="$color1"
      borderRadius="$6"
      paddingHorizontal="$2"
      paddingVertical="$1.5"
      borderColor="$borderColorBg"
      borderWidth="$0.25"
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
      <FarcasterChannelTooltip channel={channel}>
        <View
          onPress={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Link href={`/channels/${channel.channelId}`}>{Component}</Link>
        </View>
      </FarcasterChannelTooltip>
    );
  }

  return Component;
};
