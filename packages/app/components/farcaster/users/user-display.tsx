import { FarcasterUser } from "@nook/common/types";
import { NookText, Tooltip, View, XStack, YStack } from "@nook/ui";
import { FarcasterPowerBadge } from "./power-badge";
import { CdnAvatar } from "../../cdn-avatar";
import { Link } from "solito/link";
import { FarcasterBioText } from "../bio-text";
import { ReactNode } from "react";
import { UserHeader } from "../../../features/farcaster/user-profile/user-header";
import { useUser } from "../../../api/farcaster";

export const FarcasterUserTextDisplay = ({
  user,
  orientation = "horizontal",
  asLink,
  withBio,
  suffix,
}: {
  user: FarcasterUser;
  orientation?: "horizontal" | "vertical";
  asLink?: boolean;
  withBio?: boolean;
  suffix?: ReactNode;
}) => {
  const Stack = orientation === "horizontal" ? XStack : YStack;
  const bio = user?.bio?.trim().replace(/\n\s*\n/g, "\n");
  const Component = (
    <YStack flexShrink={1} gap="$1">
      <Stack
        gap={orientation === "horizontal" ? "$1.5" : "$1"}
        flexShrink={1}
        alignItems={orientation === "horizontal" ? "center" : "flex-start"}
        $xs={{ flexDirection: "column", alignItems: "flex-start", gap: "$1" }}
      >
        <XStack gap="$1.5" alignItems="center" flexShrink={1}>
          <NookText
            fontWeight="600"
            flexShrink={1}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {`${user.displayName || user.username || `!${user.fid}`} `}
          </NookText>
          <FarcasterPowerBadge badge={user.badges?.powerBadge ?? false} />
        </XStack>
        <NookText muted flexShrink={1} numberOfLines={1}>
          {user.username ? ` @${user.username}` : ` !${user.fid}`}
          {suffix ? ` ${suffix}` : ""}
        </NookText>
      </Stack>
      {withBio && bio && <FarcasterBioText text={bio} />}
    </YStack>
  );

  if (asLink) {
    return (
      <FarcasterUserTooltip user={user}>
        <View
          onPress={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Link href={`/users/${user.username}`}>{Component}</Link>
        </View>
      </FarcasterUserTooltip>
    );
  }

  return Component;
};

export const FarcasterUserDisplay = ({
  user,
  asLink,
  withBio,
  size,
  suffix,
}: {
  user: FarcasterUser;
  asLink?: boolean;
  withBio?: boolean;
  size?: string;
  suffix?: ReactNode;
}) => (
  <XStack gap="$2.5" alignItems={withBio ? "flex-start" : "center"} flex={1}>
    <FarcasterUserAvatar user={user} size={size ?? "$4"} asLink={asLink} />
    <FarcasterUserTextDisplay
      user={user}
      orientation="vertical"
      asLink={asLink}
      withBio={withBio}
      suffix={suffix}
    />
  </XStack>
);

export const FarcasterUserAvatar = ({
  user,
  size,
  asLink,
}: { user: FarcasterUser; size: string; asLink?: boolean }) => {
  const Component = <CdnAvatar src={user?.pfp} size={size} />;

  if (asLink) {
    return (
      <FarcasterUserTooltip user={user}>
        <View
          onPress={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          zIndex={2}
        >
          <Link href={`/users/${user.username}`}>{Component}</Link>
        </View>
      </FarcasterUserTooltip>
    );
  }

  return Component;
};

export const FarcasterUserTooltip = ({
  user,
  children,
}: {
  user: FarcasterUser;
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
        <UserHeader user={user} size="$6" />
      </Tooltip.Content>
    </Tooltip>
  );
};

export const FarcasterUserBadge = ({
  user,
  asLink,
}: { user: FarcasterUser; asLink?: boolean }) => {
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
      <CdnAvatar src={user.pfp} size="$0.9" />
      <View flexShrink={1}>
        <NookText
          numberOfLines={1}
          ellipsizeMode="tail"
          fontWeight="500"
          fontSize="$3"
        >
          {user.username ? `@${user.username}` : `!${user.fid}`}
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
        <Link href={`/users/${user.username}`}>{Component}</Link>
      </View>
    );
  }

  return Component;
};
