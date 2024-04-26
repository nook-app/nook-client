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
import { FarcasterUser, FarcasterUserMutualsPreview } from "../../../types";
import { useAuth } from "../../../context/auth";
import { FarcasterUserKebabMenu } from "../../../components/farcaster/users/user-kebab-menu";

export const UserHeader = ({
  user,
  size,
}: { user: FarcasterUser; size?: string }) => {
  const { session } = useAuth();
  const bio = user?.bio?.trim().replace(/\n\s*\n/g, "\n");
  return (
    <YStack gap="$3" padding="$4" width="100%">
      <View flexDirection="row" justifyContent="space-between">
        <YStack gap="$2">
          <ZoomableImage uri={user.pfp}>
            <View cursor="pointer">
              <CdnAvatar src={user.pfp} size={size || "$10"} />
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
        <XStack gap="$2">
          <FarcasterUserKebabMenu user={user} />
          <FarcasterUserFollowButton user={user} />
        </XStack>
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
      {session?.fid !== user.fid && (
        <Link href={`/users/${user.username}/mutuals`}>
          <MutualsPreview mutuals={user.context?.mutuals} />
        </Link>
      )}
    </YStack>
  );
};

const MutualsPreview = ({
  mutuals,
}: { mutuals?: FarcasterUserMutualsPreview }) => {
  const { session } = useAuth();

  if (!session || !mutuals) return null;

  const total = mutuals?.total || 0;
  const previews = mutuals?.preview || [];
  const other = total - previews.length;

  let label = "Not followed by anyone you’re following";

  switch (previews.length) {
    case 3:
      if (other > 0) {
        label = `Followed by ${
          previews[0].displayName || previews[0].username
        }, ${
          previews[1].displayName || previews[1].username
        }, and ${other} other${other > 1 ? "s" : ""} you follow`;
      } else {
        label = `Followed by ${
          previews[0].displayName || previews[0].username
        }, ${previews[1].displayName || previews[1].username}, and ${
          previews[2].displayName || previews[2].username
        }`;
      }
      break;
    case 2:
      label = `Followed by ${
        previews[0].displayName || previews[0].username
      } and ${previews[1].displayName || previews[1].username}`;
      break;
    case 1:
      label = `Followed by ${previews[0].displayName || previews[0].username}`;
  }

  return (
    <XStack gap="$3" alignItems="center" cursor="pointer" group>
      {previews.length > 0 && (
        <XStack>
          {previews.map((user) => (
            <View key={user.fid} marginRight="$-2">
              <CdnAvatar src={user.pfp} size="$1" />
            </View>
          ))}
        </XStack>
      )}
      {/* @ts-ignore */}
      <NookText
        muted
        fontSize="$3"
        $group-hover={{
          textDecoration: "underline",
        }}
      >
        {label}
      </NookText>
    </XStack>
  );
};
