"use client";

import { NookText, View, XStack, YStack } from "@nook/ui";
import { FarcasterUser } from "../../../types";
import { ZoomableImage } from "../../../components/zoomable-image";
import { CdnAvatar } from "../../../components/cdn-avatar";
import { FarcasterUserBioText } from "./bio-text";
import { Link } from "solito/link";
import { formatNumber } from "../../../utils";
import { FarcasterPowerBadge } from "../../../components/farcaster/power-badge";
import { FarcasterUserFollowButton } from "../../../components/farcaster/user-follow-button";

export const UserHeader = ({ user }: { user: FarcasterUser }) => {
  const bio = user?.bio?.trim().replace(/\n\s*\n/g, "\n");
  return (
    <YStack gap="$3" backgroundColor="$color1" padding="$4">
      <View flexDirection="row" justifyContent="space-between">
        <YStack gap="$2">
          <ZoomableImage aspectRatio={1} uri={user.pfp}>
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
              {user.context?.followers && (
                <View
                  paddingVertical="$1"
                  paddingHorizontal="$2"
                  borderRadius="$2"
                  backgroundColor="$color3"
                >
                  <NookText fontSize="$2" fontWeight="500">
                    Follows you
                  </NookText>
                </View>
              )}
            </XStack>
          </YStack>
        </YStack>
        <View>
          <FarcasterUserFollowButton fid={user.fid} />
        </View>
      </View>
      {bio && <FarcasterUserBioText text={bio} selectable />}
      <XStack gap="$2">
        <Link href={`/users/${user.fid}/following`}>
          <View flexDirection="row" alignItems="center" gap="$1">
            <NookText fontWeight="600">
              {formatNumber(user.engagement?.following || 0)}
            </NookText>
            <NookText muted>following</NookText>
          </View>
        </Link>
        <Link href={`/users/${user.fid}/followers`}>
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