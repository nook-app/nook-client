import { Text, View, XStack, YStack } from "@nook/app-ui";
import { formatAddress, formatNumber, formatTimeAgo } from "@nook/app/utils";
import { SimpleHashNFT, SimpleHashNftOwner } from "@nook/common/types";
import { CdnAvatar } from "@nook/app/components/cdn-avatar";
import { ChainBadge } from "../../components/blockchain/chain-badge";
import { NftDescription } from "./nft-description";
import { Link } from "../../components/link";
import { NftCollectionMutuals } from "./nft-collection-header";
import { useAddress } from "../../hooks/useAddress";
import { SIMPLEHASH_CHAINS } from "@nook/common/utils";

export const NftOverview = ({ nft }: { nft: SimpleHashNFT }) => {
  if (!nft.token_count || !nft.collection.collection_id) return null;

  return (
    <YStack gap="$4">
      <YStack gap="$2">
        {nft.name && (
          <Text fontWeight="700" fontSize="$8">
            {nft.name}
          </Text>
        )}
        {nft.owner_count && nft.owner_count > 1 && (
          <Link
            href={`/collectibles/${nft.nft_id}/collectors-farcaster`}
            touchable
          >
            <Text
              fontWeight="600"
              numberOfLines={1}
              fontSize="$5"
              opacity={0.8}
            >
              {`Collected by ${formatNumber(nft.owner_count || 0)} user${
                nft.owner_count === 1 ? "" : "s"
              }`}
            </Text>
          </Link>
        )}
        {nft.owner_count === 1 && <NftOwner owner={nft.owners[0]} />}
      </YStack>
      <NftCollection nft={nft} />
      {nft.description && (
        <View>
          <Text fontWeight="600" fontSize="$5">
            Description
          </Text>
          <NftDescription nft={nft} />
        </View>
      )}
    </YStack>
  );
};

const NftOwner = ({ owner }: { owner: SimpleHashNftOwner }) => {
  const { address, user, ens } = useAddress(owner.owner_address);

  if (user) {
    return (
      <Link href={`/users/${user.username}`} touchable>
        <XStack gap="$2" alignItems="center">
          <Text fontWeight="600" numberOfLines={1} fontSize="$5" opacity={0.8}>
            Collected by
          </Text>
          <CdnAvatar src={user.pfp} size="$1" />
          <Text fontWeight="600" numberOfLines={1} fontSize="$5" opacity={0.8}>
            {user.displayName || user.username || formatAddress(address)}
          </Text>
        </XStack>
      </Link>
    );
  }

  if (ens) {
    <Text fontWeight="600" numberOfLines={1} fontSize="$5" opacity={0.8}>
      {`Collected by ${ens.ens}`}
    </Text>;
  }

  return (
    <Text fontWeight="600" numberOfLines={1} fontSize="$5" opacity={0.8}>
      {`Collected by ${formatAddress(address)}`}
    </Text>
  );
};

export const NftCollection = ({ nft }: { nft: SimpleHashNFT }) => {
  return (
    <YStack
      gap="$2.5"
      borderColor="$borderColorBg"
      backgroundColor="$borderColorBg"
      // borderWidth="$1"
      borderRadius="$6"
      padding="$2.5"
    >
      <Link href={`/collections/${nft.collection.collection_id}`} touchable>
        <XStack gap="$2" alignItems="center">
          <CdnAvatar
            src={nft.collection.image_url || undefined}
            size="$1"
            skipCdn
          />
          <Text
            fontWeight="600"
            numberOfLines={1}
            fontSize="$5"
            opacity={0.8}
            flexShrink={1}
          >
            {nft.collection.name || formatAddress(nft.contract_address)}
          </Text>
        </XStack>
      </Link>
      <XStack gap="$2">
        <Link href={`/collections/${nft.collection.collection_id}`} touchable>
          <View
            flexDirection="row"
            alignItems="center"
            gap="$1"
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Text fontWeight="600" fontSize={15}>
              {formatNumber(nft.collection?.distinct_nft_count || 0)}
            </Text>
            <Text opacity={0.8} fontSize={15}>
              {`item${nft.collection.distinct_nft_count === 1 ? "" : "s"}`}
            </Text>
          </View>
        </Link>
        <Link
          href={`/collections/${nft.collection.collection_id}/collectors-farcaster`}
          touchable
        >
          <View
            flexDirection="row"
            alignItems="center"
            gap="$1"
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Text fontWeight="600" fontSize={15}>
              {formatNumber(nft.collection?.distinct_owner_count || 0)}
            </Text>
            <Text opacity={0.8} fontSize={15}>
              {`collector${
                nft.collection.distinct_owner_count === 1 ? "" : "s"
              }`}
            </Text>
          </View>
        </Link>
      </XStack>
      {nft.collection.distinct_owner_count &&
        nft.collection.distinct_owner_count <= 20000 && (
          <NftCollectionMutuals collection_id={nft.collection.collection_id} />
        )}
    </YStack>
  );
};

export const NftProperties = ({ nft }: { nft: SimpleHashNFT }) => {
  if (
    !nft.extra_metadata.attributes ||
    nft.extra_metadata.attributes.length === 0
  ) {
    return null;
  }

  return (
    <View>
      <Text fontWeight="600" fontSize="$5">
        Properties
      </Text>
      <XStack gap="$2" flexWrap="wrap" marginTop="$3">
        {nft.extra_metadata.attributes.map((attr) => (
          <YStack
            key={`${attr.trait_type}-${attr.value}`}
            backgroundColor="$shadowColorPress"
            borderRadius="$4"
            padding="$2.5"
            flexShrink={1}
            gap="$1"
          >
            <Text>{attr.value}</Text>
            <Text
              opacity={0.5}
              fontWeight="600"
              fontSize="$2"
              textTransform="uppercase"
            >
              {attr.trait_type.replaceAll("_", " ")}
            </Text>
          </YStack>
        ))}
      </XStack>
    </View>
  );
};

export const NftProvenance = ({ nft }: { nft: SimpleHashNFT }) => {
  const simplehashChain = SIMPLEHASH_CHAINS.find((c) => c.id === nft.chain);
  return (
    <YStack gap="$3">
      <Text fontWeight="600" fontSize="$5">
        Provenance
      </Text>
      <XStack gap="$4">
        {[
          {
            label: "Chain",
            value: simplehashChain?.crossChainId ? (
              <ChainBadge
                chainId={simplehashChain.crossChainId}
                fontSize="$4"
              />
            ) : (
              <Text numberOfLines={1} ellipsizeMode="tail" fontWeight="500">
                {simplehashChain?.id}
              </Text>
            ),
          },
          {
            label: "Token",
            value: (
              <Text fontWeight="600" numberOfLines={1} ellipsizeMode="tail">
                {formatAddress(nft.contract_address)}
              </Text>
            ),
          },
          {
            label: "ID",
            value: (
              <Text fontWeight="600" numberOfLines={1} ellipsizeMode="tail">
                {nft.token_id}
              </Text>
            ),
          },
        ].map(({ label, value }) => (
          <YStack key={label} gap="$1">
            {value}
            <Text
              opacity={0.5}
              fontWeight="600"
              fontSize="$2"
              textTransform="uppercase"
            >
              {label}
            </Text>
          </YStack>
        ))}
      </XStack>
      {nft.created_date && (
        <Text opacity={0.8}>{`Created ${formatTimeAgo(
          new Date(nft.created_date).getTime(),
          true,
        )}`}</Text>
      )}
    </YStack>
  );
};
