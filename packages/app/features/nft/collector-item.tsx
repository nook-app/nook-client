import {
  FarcasterUser,
  NftFarcasterCollector,
  NftOwner,
} from "@nook/common/types";
import { NookText, View, XStack, YStack } from "@nook/app-ui";
import { FarcasterUserAvatar } from "../../components/farcaster/users/user-display";
import { FarcasterUserFollowButton } from "../../components/farcaster/users/user-follow-button";
import { memo } from "react";
import { FarcasterPowerBadge } from "../../components/farcaster/users/power-badge";
import { UserFollowBadge } from "../../components/farcaster/users/user-follow-badge";
import { Link } from "../../components/link";
import { formatAddress, formatTimeAgo } from "../../utils";
import { useEns } from "../../hooks/useAddress";
import { CdnAvatar } from "../../components/cdn-avatar";

export const CollectorItem = memo(
  ({ collector }: { collector: NftOwner & { user?: FarcasterUser } }) => {
    if (!collector.user) {
      return <AddressDisplay address={collector.ownerAddress} />;
    }

    let label = `${collector.quantity} items since ${formatTimeAgo(
      collector.lastAcquiredDate,
      true,
    )}`;
    if (collector.quantity === 1) {
      label = `#${collector.tokenId} since ${formatTimeAgo(
        collector.lastAcquiredDate,
        true,
      )}`;
    }

    return (
      <Link href={`/users/${collector.user.username}`}>
        <XStack
          gap="$2.5"
          padding="$2.5"
          hoverStyle={{
            transform: "all 0.2s ease-in-out",
            backgroundColor: "$color2",
          }}
        >
          <FarcasterUserAvatar user={collector.user} size="$4" />
          <YStack flexShrink={1} gap="$1" flexGrow={1}>
            <XStack justifyContent="space-between">
              <YStack gap="$1">
                <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                  <NookText
                    fontWeight="700"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {`${
                      collector.user.displayName ||
                      collector.user.username ||
                      `!${collector.user.fid}`
                    }`}
                  </NookText>
                  <FarcasterPowerBadge
                    badge={collector.user.badges?.powerBadge ?? false}
                  />
                </XStack>
                <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                  <NookText
                    muted
                    numberOfLines={1}
                    ellipsizeMode="middle"
                    flexShrink={1}
                  >
                    {collector.user.username
                      ? `@${collector.user.username}`
                      : `!${collector.user.fid}`}
                  </NookText>
                  <UserFollowBadge user={collector.user} />
                </XStack>
              </YStack>
              <FarcasterUserFollowButton user={collector.user} />
            </XStack>
            <NookText muted>{label}</NookText>
          </YStack>
        </XStack>
      </Link>
    );
  },
);

export const FarcasterCollectorItem = memo(
  ({ collector }: { collector: NftFarcasterCollector }) => {
    if (!collector.user) return null;

    let label = `${collector.quantity} items since ${formatTimeAgo(
      collector.lastAcquiredDate,
      true,
    )}`;
    if (collector.quantity === 1 && collector.tokens.length === 1) {
      label = `#${collector.tokens[0].tokenId} since ${formatTimeAgo(
        collector.lastAcquiredDate,
        true,
      )}`;
    }

    return (
      <Link href={`/users/${collector.user.username}`}>
        <XStack
          gap="$2.5"
          padding="$2.5"
          hoverStyle={{
            transform: "all 0.2s ease-in-out",
            backgroundColor: "$color2",
          }}
        >
          <FarcasterUserAvatar user={collector.user} size="$4" />
          <YStack flexShrink={1} gap="$1" flexGrow={1}>
            <XStack justifyContent="space-between">
              <YStack gap="$1">
                <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                  <NookText
                    fontWeight="700"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {`${
                      collector.user.displayName ||
                      collector.user.username ||
                      `!${collector.user.fid}`
                    }`}
                  </NookText>
                  <FarcasterPowerBadge
                    badge={collector.user.badges?.powerBadge ?? false}
                  />
                </XStack>
                <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                  <NookText
                    muted
                    numberOfLines={1}
                    ellipsizeMode="middle"
                    flexShrink={1}
                  >
                    {collector.user.username
                      ? `@${collector.user.username}`
                      : `!${collector.user.fid}`}
                  </NookText>
                  <UserFollowBadge user={collector.user} />
                </XStack>
              </YStack>
              <FarcasterUserFollowButton user={collector.user} />
            </XStack>
            <NookText muted>{label}</NookText>
          </YStack>
        </XStack>
      </Link>
    );
  },
);

const AddressDisplay = ({ address }: { address: string }) => {
  const { data: ens } = useEns(address, true);
  return (
    <Link href={`https://www.onceupon.xyz/${address}`} isExternal>
      <XStack
        gap="$2.5"
        padding="$2.5"
        hoverStyle={{
          transform: "all 0.2s ease-in-out",
          backgroundColor: "$color2",
        }}
      >
        <CdnAvatar
          src={ens?.avatar_small || ens?.avatar || ""}
          size="$4"
          skipCdn
        />
        <YStack flexShrink={1} gap="$1" flexGrow={1}>
          <XStack justifyContent="space-between">
            <YStack gap="$1">
              <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                <NookText
                  fontWeight="700"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {ens?.ens ?? formatAddress(address)}
                </NookText>
              </XStack>
              <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                <NookText
                  muted
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  flexShrink={1}
                >
                  {formatAddress(address)}
                </NookText>
              </XStack>
            </YStack>
            <View />
          </XStack>
        </YStack>
      </XStack>
    </Link>
  );
};
