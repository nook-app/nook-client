import { NookText, Text, View } from "@nook/app-ui";
import { NftEvent } from "@nook/common/types";
import { XStack, YStack } from "@nook/app-ui";
import { FarcasterUserAvatar } from "../../components/farcaster/users/user-display";
import { FarcasterPowerBadge } from "../../components/farcaster/users/power-badge";
import { formatAddress, formatTimeAgo } from "../../utils";
import { NftDisplay } from "./nft-display";
import { ChainBadge } from "../../components/blockchain/chain-badge";
import { useEns } from "../../hooks/useAddress";
import { CdnAvatar } from "../../components/cdn-avatar";
import { NftEventMenu } from "./nft-event-menu";
import { formatUnits } from "viem";
import { GradientIcon } from "../../components/gradient-icon";
import { SIMPLEHASH_CHAINS } from "@nook/common/utils";

export const NftEventItem = ({ event }: { event: NftEvent }) => {
  const chain = SIMPLEHASH_CHAINS.find((chain) => chain.id === event.chain);

  const user =
    event.event_type === "mint" || event.event_type === "sale"
      ? event.to_user
      : event.from_user;
  const address =
    event.event_type === "mint" || event.event_type === "sale"
      ? event.to_address
      : event.from_address;

  return (
    <XStack
      gap="$2"
      transition="all 0.2s ease-in-out"
      hoverStyle={{
        // @ts-ignore
        transition: "all 0.2s ease-in-out",
        backgroundColor: "$color2",
      }}
      cursor="pointer"
      padding="$2.5"
    >
      <YStack alignItems="center" width="$4" marginTop="$1">
        {user && <FarcasterUserAvatar user={user} size="$4" asLink />}
        {!user && <AddressAvatar address={address} />}
      </YStack>
      <YStack flex={1} gap="$2">
        <YStack>
          <XStack
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            {user && (
              <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                <NookText
                  fontWeight="700"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {`${user.displayName || user.username || `!${user.fid}`}`}
                </NookText>
                <FarcasterPowerBadge badge={user.badges?.powerBadge ?? false} />
                <NookText
                  muted
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  flexShrink={1}
                >
                  {`${
                    user.username ? `@${user.username}` : `!${user.fid}`
                  } · ${formatTimeAgo(new Date(event.timestamp).getTime())}`}
                </NookText>
              </XStack>
            )}
            {!user && (
              <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                <Address address={address} fontWeight="700" />
                <NookText
                  muted
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  flexShrink={1}
                >
                  {`· ${formatTimeAgo(new Date(event.timestamp).getTime())}`}
                </NookText>
              </XStack>
            )}
            <NftEventMenu event={event} />
          </XStack>
          <EventText event={event} />
          {event.nft_details && <NftDisplay nft={event.nft_details} />}
        </YStack>
        <XStack justifyContent="space-between" alignItems="center">
          <View />
          <View>
            {chain?.crossChainId && <ChainBadge chainId={chain.crossChainId} />}
          </View>
        </XStack>
      </YStack>
    </XStack>
  );
};

const Address = ({
  address,
  fontWeight,
}: { address: string; fontWeight: "500" | "700" }) => {
  const { data } = useEns(address, true);

  return (
    <NookText fontWeight={fontWeight} numberOfLines={1} ellipsizeMode="tail">
      {data?.ens ?? formatAddress(address)}
    </NookText>
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

const EventText = ({ event }: { event: NftEvent }) => {
  if (event.event_type === "mint") {
    return (
      <Text lineHeight={24} fontWeight="500">
        Minted
      </Text>
    );
  }

  if (event.event_type === "transfer") {
    return (
      <Text lineHeight={24}>
        <Text fontWeight="500">Transferred</Text>
        <Text>{" to "}</Text>
        <Address address={event.to_address} fontWeight="500" />
      </Text>
    );
  }

  if (event.event_type === "sale") {
    return (
      <Text lineHeight={24}>
        <Text fontWeight="500">Bought</Text>
        <Text>{" from "}</Text>
        <Address address={event.from_address} fontWeight="500" />
        <Text>{" for "}</Text>
        <Text fontWeight="500">
          {formatUnits(
            BigInt(event.sale_details.total_price),
            event.sale_details.payment_token.decimals || 18,
          )}{" "}
          ETH
        </Text>
      </Text>
    );
  }

  return (
    <Text lineHeight={24} fontWeight="500">
      {event.event_type}
    </Text>
  );
};
