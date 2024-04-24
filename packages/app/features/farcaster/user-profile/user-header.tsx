"use client";

import { NookText, View, XStack, YStack } from "@nook/ui";
import { ZoomableImage } from "../../../components/zoomable-image";
import { CdnAvatar } from "../../../components/cdn-avatar";
import { FarcasterBioText } from "../../../components/farcaster/bio-text";
import { Link } from "solito/link";
import { formatNumber } from "../../../utils";
import { FarcasterPowerBadge } from "../../../components/farcaster/users/power-badge";
import { FarcasterUserFollowButton } from "../../../components/farcaster/users/user-follow-button";
import { UserFollowBadge } from "../../../components/farcaster/users/user-follow-badge";
import { useUser } from "../../../api/farcaster";

export const UserHeader = ({ username }: { username: string }) => {
  const { data: user } = useUser(username);
  if (!user) return null;

  const bio = user?.bio?.trim().replace(/\n\s*\n/g, "\n");
  return (
    <YStack gap="$3" padding="$4">
      <View flexDirection="row" justifyContent="space-between">
        <YStack gap="$2">
          <ZoomableImage uri={user.pfp}>
            <View cursor="pointer">
              <CdnAvatar src={user.pfp} size="$10" />
            </View>
          </ZoomableImage>
          <YStack gap="$1">
            <XStack gap="$1.5" alignItems="center">
              <NookText fontWeight="600" fontSize="$6">
                {user.displayName || user.username}
              </NookText>
              <FarcasterPowerBadge badge={user.badges?.powerBadge ?? false} />
            </XStack>
            <XStack gap="$2" alignItems="center">
              <NookText muted>
                {user.username ? `@${user.username}` : `!${user.fid}`}
              </NookText>
              <NookText muted>{`#${user.fid}`}</NookText>
              <UserFollowBadge user={user} />
            </XStack>
          </YStack>
        </YStack>
        <View>
          <FarcasterUserFollowButton username={username} />
        </View>
      </View>
      {bio && <FarcasterBioText text={bio} selectable />}
      <XStack gap="$2">
        <Link href={`/users/${user.username}/following`}>
          <View flexDirection="row" alignItems="center" gap="$1">
            <NookText fontWeight="600">
              {formatNumber(user.engagement?.following || 0)}
            </NookText>
            <NookText muted>following</NookText>
          </View>
        </Link>
        <Link href={`/users/${user.username}/followers`}>
          <View flexDirection="row" alignItems="center" gap="$1">
            <NookText fontWeight="600">
              {formatNumber(user.engagement?.followers || 0)}
            </NookText>
            <NookText muted>followers</NookText>
          </View>
        </Link>
      </XStack>
    </YStack>
  );
};
