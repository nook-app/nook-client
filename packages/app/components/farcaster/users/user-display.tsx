import { FarcasterUser } from "../../../types";
import { NookText, View, XStack, YStack } from "@nook/ui";
import { FarcasterPowerBadge } from "./power-badge";
import { CdnAvatar } from "../../cdn-avatar";
import { Link } from "solito/link";

export const FarcasterUserTextDisplay = ({
  user,
  orientation = "horizontal",
  asLink,
}: {
  user: FarcasterUser;
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
          {`${user.displayName || user.username || `!${user.fid}`} `}
        </NookText>
        <FarcasterPowerBadge badge={user.badges?.powerBadge ?? false} />
      </XStack>
      <NookText muted flexShrink={1} numberOfLines={1}>
        {user.username ? ` @${user.username}` : ` !${user.fid}`}
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
        <Link href={`/users/${user.username}`}>{Component}</Link>
      </View>
    );
  }

  return Component;
};

export const FarcasterUserDisplay = ({
  user,
  asLink,
}: { user: FarcasterUser; asLink?: boolean }) => (
  <XStack gap="$2.5" alignItems="center" flex={1}>
    <FarcasterUserAvatar user={user} size="$4" asLink={asLink} />
    <FarcasterUserTextDisplay
      user={user}
      orientation="vertical"
      asLink={asLink}
    />
  </XStack>
);

export const FarcasterUserAvatar = ({
  user,
  size,
  asLink,
}: { user: FarcasterUser; size: string; asLink?: boolean }) => {
  const Component = <CdnAvatar src={user.pfp} size={size} />;

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
      borderColor="$borderColor"
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
