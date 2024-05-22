import { NookText, Text, View } from "@nook/app-ui";
import { NftEvent, SIMPLEHASH_CHAINS } from "@nook/common/types";
import { XStack, YStack } from "@nook/app-ui";
import { FarcasterUserAvatar } from "../../components/farcaster/users/user-display";
import { FarcasterPowerBadge } from "../../components/farcaster/users/power-badge";
import { formatAddress, formatTimeAgo } from "../../utils";
import { NftDisplay } from "./nft-display";
import { ChainBadge } from "../../components/blockchain/chain-badge";
import { useEns } from "../../hooks/useAddress";
import { CdnAvatar } from "../../components/cdn-avatar";
import { NftEventMenu } from "./nft-event-menu";

export const NftEventItem = ({ event }: { event: NftEvent }) => {
  const chain = SIMPLEHASH_CHAINS.find((chain) => chain.id === event.chain);
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
        {event.to_user && (
          <FarcasterUserAvatar user={event.to_user} size="$4" asLink />
        )}
        {!event.to_user && <AddressAvatar address={event.to_address} />}
      </YStack>
      <YStack flex={1} gap="$2">
        <YStack>
          <XStack
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            {event.to_user && (
              <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                <NookText
                  fontWeight="700"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {`${
                    event.to_user.displayName ||
                    event.to_user.username ||
                    `!${event.to_user.fid}`
                  }`}
                </NookText>
                <FarcasterPowerBadge
                  badge={event.to_user.badges?.powerBadge ?? false}
                />
                <NookText
                  muted
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  flexShrink={1}
                >
                  {`${
                    event.to_user.username
                      ? `@${event.to_user.username}`
                      : `!${event.to_user.fid}`
                  } · ${formatTimeAgo(new Date(event.timestamp).getTime())}`}
                </NookText>
              </XStack>
            )}
            {!event.to_user && (
              <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                <Address address={event.to_address} />
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
          <NftDisplay nft={event.nft_details} />
        </YStack>
        <XStack justifyContent="space-between" alignItems="center">
          <View />
          <View>
            {chain?.crosschainId && <ChainBadge chainId={chain.crosschainId} />}
          </View>
        </XStack>
      </YStack>
    </XStack>
  );
};

const Address = ({ address }: { address: string }) => {
  const { data } = useEns(address, true);

  return (
    <NookText fontWeight="700" numberOfLines={1} ellipsizeMode="tail">
      {data?.ens ?? formatAddress(address)}
    </NookText>
  );
};

const AddressAvatar = ({ address }: { address: string }) => {
  const { data } = useEns(address, true);

  return (
    <CdnAvatar
      src={data?.avatar_small || data?.avatar || ""}
      size="$4"
      skipCdn
    />
  );
};

const EventText = ({ event }: { event: NftEvent }) => {
  console.log(event);
  if (event.event_type === "mint") {
    return (
      <Text lineHeight={20} fontWeight="500">
        Minted
      </Text>
    );
  }
  return (
    <Text lineHeight={20} fontWeight="500">
      {event.event_type}
    </Text>
  );
};
