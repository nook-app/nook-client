import { FarcasterUserV1, Token, TokenHolder } from "@nook/common/types";
import { NookText, View, XStack, YStack } from "@nook/app-ui";
import { FarcasterUserAvatar } from "../../components/farcaster/users/user-display";
import { FarcasterUserFollowButton } from "../../components/farcaster/users/user-follow-button";
import { memo } from "react";
import { FarcasterPowerBadge } from "../../components/farcaster/users/power-badge";
import { UserFollowBadge } from "../../components/farcaster/users/user-follow-badge";
import { Link } from "../../components/link";
import { formatAddress, formatNumber, formatPrice } from "../../utils";
import { useEns } from "../../hooks/useAddress";
import { CdnAvatar } from "../../components/cdn-avatar";
import { GradientIcon } from "../../components/gradient-icon";
import { ChainIcon } from "../../components/blockchain/chain-icon";
import { CHAINS_BY_NAME } from "../../utils/chains";
import { formatUnits } from "viem";

export const TokenHolderItem = memo(
  ({
    token,
    holder,
  }: { token: Token; holder: TokenHolder & { user?: FarcasterUserV1 } }) => {
    if (!holder.user) {
      return <AddressDisplay token={token} holder={holder} />;
    }

    const quantity = parseFloat(
      formatUnits(BigInt(holder.quantity), token.instances[0].decimals),
    );

    return (
      <Link href={`/users/${holder.user.username}`}>
        <XStack
          gap="$2.5"
          padding="$2.5"
          hoverStyle={{
            transform: "all 0.2s ease-in-out",
            backgroundColor: "$color2",
          }}
        >
          <FarcasterUserAvatar user={holder.user} size="$4" />
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
                      holder.user.displayName ||
                      holder.user.username ||
                      `!${holder.user.fid}`
                    }`}
                  </NookText>
                  <FarcasterPowerBadge
                    badge={holder.user.badges?.powerBadge ?? false}
                  />
                </XStack>
                <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                  <NookText
                    muted
                    numberOfLines={1}
                    ellipsizeMode="middle"
                    flexShrink={1}
                  >
                    {holder.user.username
                      ? `@${holder.user.username}`
                      : `!${holder.user.fid}`}
                  </NookText>
                  <UserFollowBadge user={holder.user} />
                </XStack>
              </YStack>
              <FarcasterUserFollowButton user={holder.user} />
            </XStack>
            <XStack gap="$1.5" alignItems="center">
              <ChainIcon
                chainId={CHAINS_BY_NAME[holder.chainId]?.crossChainId}
              />
              <NookText muted>{`${formatNumber(quantity, 2)} ${token.symbol}${
                token.stats.price > 0
                  ? ` · $${formatPrice(token.stats.price * quantity)}`
                  : ""
              }`}</NookText>
            </XStack>
          </YStack>
        </XStack>
      </Link>
    );
  },
);

const AddressDisplay = ({
  token,
  holder,
}: { token: Token; holder: TokenHolder }) => {
  const { data: ens } = useEns(holder.ownerAddress, true);

  const quantity = parseFloat(
    formatUnits(BigInt(holder.quantity), token.instances[0].decimals),
  );

  return (
    <Link href={`https://www.onceupon.xyz/${holder.ownerAddress}`} isExternal>
      <XStack
        gap="$2.5"
        padding="$2.5"
        hoverStyle={{
          transform: "all 0.2s ease-in-out",
          backgroundColor: "$color2",
        }}
      >
        <AddressAvatar address={holder.ownerAddress} />
        <YStack flexShrink={1} gap="$1" flexGrow={1}>
          <XStack justifyContent="space-between">
            <YStack gap="$1">
              <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                <NookText
                  fontWeight="700"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {ens?.ens ?? formatAddress(holder.ownerAddress)}
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
                    {formatAddress(holder.ownerAddress)}
                  </NookText>
                </XStack>
              )}
            </YStack>
            <View />
          </XStack>
          <XStack gap="$1.5" alignItems="center">
            <ChainIcon chainId={CHAINS_BY_NAME[holder.chainId]?.crossChainId} />
            <NookText muted>{`${formatNumber(quantity)}${
              token.stats.price > 0
                ? ` · $${formatPrice(token.stats.price * quantity)}`
                : ""
            }`}</NookText>
          </XStack>
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
