import {
  FarcasterUserV1,
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
import { GradientIcon } from "../../components/gradient-icon";

export const CollectorItem = memo(
  ({ collector }: { collector: NftOwner & { user?: FarcasterUserV1 } }) => {
    if (!collector.user) {
      return <AddressDisplay collector={collector} />;
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

    let label = `${collector.quantity} item${
      collector.quantity > 1 ? "s" : ""
    } since ${formatTimeAgo(collector.lastAcquiredDate, true)}`;
    const tokenId = collector.tokens?.[0]?.tokenId;
    if (collector.quantity === 1 && tokenId) {
      label = `#${tokenId} since ${formatTimeAgo(
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

const AddressDisplay = ({ collector }: { collector: NftOwner }) => {
  const { data: ens } = useEns(collector.ownerAddress, true);

  let label = `${collector.quantity} item${
    collector.quantity > 1 ? "s" : ""
  } since ${formatTimeAgo(collector.lastAcquiredDate, true)}`;
  if (collector.quantity === 1) {
    label = `#${collector.tokenId} since ${formatTimeAgo(
      collector.lastAcquiredDate,
      true,
    )}`;
  }

  return (
    <Link
      href={`https://www.onceupon.xyz/${collector.ownerAddress}`}
      isExternal
    >
      <XStack
        gap="$2.5"
        padding="$2.5"
        hoverStyle={{
          transform: "all 0.2s ease-in-out",
          backgroundColor: "$color2",
        }}
      >
        <AddressAvatar address={collector.ownerAddress} />
        <YStack flexShrink={1} gap="$1" flexGrow={1}>
          <XStack justifyContent="space-between">
            <YStack gap="$1">
              <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                <NookText
                  fontWeight="700"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {ens?.ens ?? formatAddress(collector.ownerAddress)}
                </NookText>
              </XStack>
              {ens?.ens && (
                <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                  <NookText
                    muted
                    numberOfLines={1}
                    ellipsizeMode="middle"
                    flexShrink={1}
                  >
                    {formatAddress(collector.ownerAddress)}
                  </NookText>
                </XStack>
              )}
            </YStack>
            <View />
          </XStack>
          <NookText muted>{label}</NookText>
        </YStack>
      </XStack>
    </Link>
  );
};

const AddressAvatar = ({ address }: { address: string }) => {
  const { data } = useEns(address, true);

  if (data?.avatar_small || data?.avatar) {
    return (
      <CdnAvatar src={data?.avatar_small || data?.avatar} size="$4" skipCdn />
    );
  }

  return (
    <GradientIcon
      label={data?.ens ?? formatAddress(address)}
      size="$4"
      borderRadius="$10"
    />
  );
};
