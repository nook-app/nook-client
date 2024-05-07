import { NookText, Text, Tooltip, View, XStack, YStack } from "@nook/ui";
import { Channel } from "@nook/common/types";
import { Link } from "solito/link";
import { CdnAvatar } from "../../cdn-avatar";
import { FarcasterBioText } from "../bio-text";
import { ReactNode } from "react";
import { ChannelHeader } from "../../../features/farcaster/channel-profile/channel-header";
import { ChannelOverview } from "./channel-overview";

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

export const FarcasterChannelTooltip = ({
  channel,
  children,
}: {
  channel: Channel;
  children: ReactNode;
}) => {
  return (
    <Tooltip delay={100}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Content
        enterStyle={{ x: 0, y: -5, opacity: 0, scale: 0.9 }}
        exitStyle={{ x: 0, y: -5, opacity: 0, scale: 0.9 }}
        scale={1}
        x={0}
        y={0}
        opacity={1}
        animation={[
          "100ms",
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
        backgroundColor="$color1"
        borderColor="$borderColorBg"
        borderWidth="$0.25"
        padding="$0"
        width={400}
        $sm={{ width: "auto" }}
      >
        <ChannelOverview channel={channel} />
      </Tooltip.Content>
    </Tooltip>
  );
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
