import { Text, View, XStack, YStack } from "@nook/app-ui";
import { formatAddress, formatNumber, formatTimeAgo } from "@nook/app/utils";
import { SIMPLEHASH_CHAINS, SimpleHashNFT } from "@nook/common/types";
import { CdnAvatar } from "@nook/app/components/cdn-avatar";
import { useAuth } from "@nook/app/context/auth";
import { useQuery } from "@tanstack/react-query";
import { fetchCollectionMutualsPreview } from "@nook/app/api/nft";
import { ChainBadge } from "../../components/blockchain/chain-badge";
import { NftDescription } from "./nft-description";
import { Link } from "../../components/link";

export const NftOverview = ({ nft }: { nft: SimpleHashNFT }) => {
  if (!nft.token_count || !nft.collection.collection_id) return null;

  const isEdition = nft.token_count > 1;

  return (
    <YStack gap="$6">
      <YStack gap="$2">
        {nft.name && (
          <Text fontWeight="700" fontSize="$8">
            {nft.name}
          </Text>
        )}
        <XStack gap="$2" alignItems="center">
          <CdnAvatar
            src={nft.collection.image_url || undefined}
            size="$1"
            skipCdn
          />
          <Text fontWeight="600" numberOfLines={1} fontSize="$5" opacity={0.8}>
            {nft.collection.name || formatAddress(nft.contract_address)}
          </Text>
        </XStack>
        {isEdition && (
          <YStack gap="$3" marginTop="$3">
            <XStack gap="$2">
              <View
                flexDirection="row"
                alignItems="center"
                gap="$1"
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Text fontWeight="600" fontSize={15}>
                  {formatNumber(nft.token_count || 0)}
                </Text>
                <Text opacity={0.8} fontSize={15}>
                  editions
                </Text>
              </View>
              <View
                flexDirection="row"
                alignItems="center"
                gap="$1"
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Text fontWeight="600" fontSize={15}>
                  {formatNumber(nft.owner_count || 0)}
                </Text>
                <Text opacity={0.8} fontSize={15}>
                  collectors
                </Text>
              </View>
            </XStack>
          </YStack>
        )}
        {!isEdition && (
          <YStack gap="$3" marginTop="$3">
            <XStack gap="$2">
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
                  collectibles
                </Text>
              </View>
              <Link
                href={`/collections/${nft.collection.collection_id}/collectors-farcaster`}
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
                    collectors
                  </Text>
                </View>
              </Link>
            </XStack>
            {nft.collection.distinct_owner_count &&
              nft.collection.distinct_owner_count <= 20000 && (
                <NftCollectionMutuals
                  collection_id={nft.collection.collection_id}
                />
              )}
          </YStack>
        )}
      </YStack>
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

const NftCollectionMutuals = ({ collection_id }: { collection_id: string }) => {
  const { session } = useAuth();
  const { data } = useQuery({
    queryKey: ["nftCollectionMutualsPreview", collection_id],
    queryFn: async () => {
      return await fetchCollectionMutualsPreview(collection_id);
    },
    enabled: !!session?.fid,
  });

  if (!session || !data) return null;

  const total = data?.total || 0;
  const previews = data?.preview || [];
  const other = total - previews.length;

  let label = "Not collected by anyone you’re following";

  switch (previews.length) {
    case 3:
      if (other > 0) {
        label = `Collected by ${previews[0].username}, ${
          previews[1].username
        }, and ${other} other${other > 1 ? "s" : ""} you follow`;
      } else {
        label = `Collected by ${previews[0].username}, ${previews[1].username}, and ${previews[2].username}`;
      }
      break;
    case 2:
      label = `Collected by ${previews[0].username} and ${previews[1].username}`;
      break;
    case 1:
      label = `Collected by ${previews[0].username}`;
  }

  return (
    <Link
      href={`/collections/${collection_id}/collectors-following`}
      unpressable
    >
      <XStack
        gap="$3"
        alignItems="center"
        cursor="pointer"
        group
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
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
        <Text
          opacity={0.8}
          $group-hover={{
            textDecoration: "underline",
          }}
          flexShrink={1}
        >
          {label}
        </Text>
      </XStack>
    </Link>
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
            value: simplehashChain?.crosschainId ? (
              <ChainBadge
                chainId={simplehashChain.crosschainId}
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
