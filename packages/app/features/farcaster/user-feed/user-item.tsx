import { FarcasterUser } from "@nook/common/types";
import { NookText, XStack, YStack } from "@nook/app-ui";
import { FarcasterUserAvatar } from "../../../components/farcaster/users/user-display";
import { FarcasterUserFollowButton } from "../../../components/farcaster/users/user-follow-button";
import { memo } from "react";
import { FarcasterBioText } from "../../../components/farcaster/bio-text";
import { FarcasterPowerBadge } from "../../../components/farcaster/users/power-badge";
import { UserFollowBadge } from "../../../components/farcaster/users/user-follow-badge";
import { Link } from "../../../components/link";

export const FarcasterUserItem = memo(({ user }: { user: FarcasterUser }) => {
  const bio = user?.bio?.trim().replace(/\n\s*\n/g, "\n");
  return (
    <Link href={`/users/${user.username}`}>
      <XStack
        gap="$2.5"
        padding="$2.5"
        hoverStyle={{
          transform: "all 0.2s ease-in-out",
          backgroundColor: "$color2",
        }}
      >
        <FarcasterUserAvatar user={user} size="$4" />
        <YStack flexShrink={1} gap="$1" flexGrow={1}>
          <XStack justifyContent="space-between">
            <YStack gap="$1">
              <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                <NookText
                  fontWeight="700"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {`${user.displayName || user.username || `!${user.fid}`}`}
                </NookText>
                <FarcasterPowerBadge badge={user.badges?.powerBadge ?? false} />
              </XStack>
              <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                <NookText
                  muted
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  flexShrink={1}
                >
                  {user.username ? `@${user.username}` : `!${user.fid}`}
                </NookText>
                <UserFollowBadge user={user} />
              </XStack>
            </YStack>
            <FarcasterUserFollowButton user={user} />
          </XStack>
          {bio && <FarcasterBioText text={bio} numberOfLines={3} />}
        </YStack>
      </XStack>
    </Link>
  );
});
