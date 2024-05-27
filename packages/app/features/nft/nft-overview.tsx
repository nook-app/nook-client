import { Text, View, XStack, YStack } from "@nook/app-ui";
import { formatAddress, formatNumber, formatTimeAgo } from "@nook/app/utils";
import {
  NftAsk,
  NftMintStage,
  SimpleHashNFT,
  SimpleHashNftOwner,
} from "@nook/common/types";
import { CdnAvatar } from "@nook/app/components/cdn-avatar";
import { ChainBadge } from "../../components/blockchain/chain-badge";
import { NftDescription } from "./nft-description";
import { Link, LinkButton } from "../../components/link";
import { NftCollectionMutuals } from "./nft-collection-header";
import { useAddress } from "../../hooks/useAddress";
import { SIMPLEHASH_CHAINS } from "@nook/common/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchNftMarkets, fetchNftMutualsPreview } from "../../api/nft";
import { ExternalLink } from "@tamagui/lucide-icons";
import { formatUnits } from "viem";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "../../context/auth";

export const NftOverview = ({ nft }: { nft: SimpleHashNFT }) => {
  if (!nft.token_count || !nft.collection.collection_id) return null;

  return (
    <YStack gap="$4">
      <YStack gap="$1">
        {nft.name && (
          <Text fontWeight="700" fontSize="$8">
            {nft.name}
          </Text>
        )}
        {nft.owner_count && nft.owner_count > 1 && <NftOwners nft={nft} />}
        {nft.owner_count === 1 && <NftOwner owner={nft.owners[0]} />}
      </YStack>
      <NftMarkets nft={nft} />
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

const NftOwners = ({ nft }: { nft: SimpleHashNFT }) => {
  const { session } = useAuth();
  const { data } = useQuery({
    queryKey: ["nftCollectionMutualsPreview", nft.nft_id],
    queryFn: async () => {
      return await fetchNftMutualsPreview(nft.nft_id);
    },
    enabled: !!session?.fid,
  });

  if (!session || !data || data.total === 0 || data.preview.length === 0) {
    return (
      <Link href={`/collectibles/${nft.nft_id}/collectors-farcaster`} touchable>
        <Text fontWeight="600" numberOfLines={1} fontSize="$5" opacity={0.8}>
          {`Collected by ${formatNumber(nft.owner_count || 0)} user${
            nft.owner_count === 1 ? "" : "s"
          }`}
        </Text>
      </Link>
    );
  }

  const previews = data?.preview || [];
  const other = (nft.owner_count || 0) - previews.length;

  const parts: JSX.Element[] = [];

  const FormattedText = ({ children }: { children?: ReactNode }) => (
    <Text fontWeight="600" fontSize="$5" opacity={0.8} lineHeight={24}>
      {children}
    </Text>
  );

  parts.push(<FormattedText>Collected by </FormattedText>);

  if (previews[0]) {
    parts.push(
      <CdnAvatar src={previews[0].pfp} size="$1" />,
      <FormattedText>{` ${previews[0].username}`}</FormattedText>,
    );
  }

  if (previews[1]) {
    if (other === 0) {
      parts.push(<FormattedText>{" and "}</FormattedText>);
    } else {
      parts.push(<FormattedText>{", "}</FormattedText>);
    }
    parts.push(
      <CdnAvatar src={previews[1].pfp} size="$1" />,
      <FormattedText>{` ${previews[1].username}`}</FormattedText>,
    );
    if (other > 0) {
      parts.push(<FormattedText>{","}</FormattedText>);
    }
  }

  if (other === 1) {
    parts.push(
      <FormattedText>{` and ${formatNumber(other)} other`}</FormattedText>,
    );
  } else if (other > 1) {
    parts.push(
      <FormattedText>{` and ${formatNumber(other)} others`}</FormattedText>,
    );
  }

  return (
    <Link href={`/collectibles/${nft.nft_id}/collectors-farcaster`} touchable>
      <XStack
        gap="$3"
        cursor="pointer"
        group
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        {/* @ts-ignore */}
        <Text
          $group-hover={{
            textDecoration: "underline",
          }}
          flexShrink={1}
        >
          {parts}
        </Text>
      </XStack>
    </Link>
  );
};

const NftOwner = ({ owner }: { owner: SimpleHashNftOwner }) => {
  const { address, user, ens } = useAddress(owner.owner_address);

  if (user) {
    return (
      <Link href={`/users/${user.username}`} touchable>
        <Text lineHeight={24}>
          <Text fontWeight="600" numberOfLines={1} fontSize="$5" opacity={0.8}>
            {"Collected by "}
          </Text>
          <CdnAvatar src={user.pfp} size="$1" />
          <Text fontWeight="600" numberOfLines={1} fontSize="$5" opacity={0.8}>
            {` ${user.displayName || user.username || formatAddress(address)}`}
          </Text>
        </Text>
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
      <YStack gap="$1">
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
        {nft.contract.deployed_by && (
          <NftCollectionCreator creatorAddress={nft.contract.deployed_by} />
        )}
      </YStack>
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

const NftCollectionCreator = ({
  creatorAddress,
}: { creatorAddress: string }) => {
  const { address, user, ens } = useAddress(creatorAddress);

  if (user) {
    return (
      <Link href={`/users/${user.username}`} touchable>
        <Text lineHeight={24}>
          <Text fontWeight="600" numberOfLines={1} fontSize="$5" opacity={0.8}>
            {"Created by "}
          </Text>
          <CdnAvatar src={user.pfp} size="$1" />
          <Text fontWeight="600" numberOfLines={1} fontSize="$5" opacity={0.8}>
            {` ${user.displayName || user.username || formatAddress(address)}`}
          </Text>
        </Text>
      </Link>
    );
  }

  if (ens) {
    <Text fontWeight="600" numberOfLines={1} fontSize="$5" opacity={0.8}>
      {`Created by ${ens.ens}`}
    </Text>;
  }

  return (
    <Text fontWeight="600" numberOfLines={1} fontSize="$5" opacity={0.8}>
      {`Created by ${formatAddress(address)}`}
    </Text>
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
          new Date(nft.created_date).getTime() -
            new Date().getTimezoneOffset() * 60000,
          true,
        )}`}</Text>
      )}
    </YStack>
  );
};

const NftMarkets = ({ nft }: { nft: SimpleHashNFT }) => {
  const { data } = useQuery({
    queryKey: ["nftMarkets", nft.nft_id],
    queryFn: async () => {
      return await fetchNftMarkets(nft.nft_id);
    },
  });

  if (!data) return null;

  const publicMint = data.mintStages.find(({ kind }) => kind === "public");
  if (publicMint) {
    return <NftMint nft={nft} mint={publicMint} />;
  }

  if (data.market.floorAsk?.id) {
    return <NftListing nft={nft} ask={data.market.floorAsk} />;
  }

  return null;
};

const NftMint = ({ nft, mint }: { nft: SimpleHashNFT; mint: NftMintStage }) => {
  const [endTimeDisplay, setEndTimeDisplay] = useState<string | undefined>();

  useEffect(() => {
    if (mint.endTime) {
      const timer = setInterval(() => {
        const currentTime = new Date().getTime();
        const endTimeDate = new Date(mint.endTime * 1000).getTime();
        const timeLeft = endTimeDate - currentTime;

        if (timeLeft <= 0) {
          clearInterval(timer);
          setEndTimeDisplay("Mint ended");
        } else {
          const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
          const seconds = Math.floor((timeLeft / 1000) % 60);
          setEndTimeDisplay(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
    setEndTimeDisplay(undefined);
  }, [mint.endTime]);

  const href =
    nft.contract.deployed_via_contract ===
    "0x777777C338d93e2C7adf08D102d45CA7CC4Ed021"
      ? `https://zora.co/collect/base:${nft.nft_id.split(".")[0]}/${
          nft.token_id
        }`
      : `https://mint.fun/${nft.nft_id.split(".")[0]}/${nft.contract_address}`;

  return (
    <YStack gap="$2">
      <LinkButton href={href}>
        <Text fontWeight="600" fontSize="$5" color="$color1">
          {"Mint "}
          <ExternalLink color="$color1" size={16} strokeWidth={2.5} />
        </Text>
      </LinkButton>
      <XStack justifyContent="center">
        <Text opacity={0.6} fontWeight="500">
          {`${formatUnits(
            BigInt(mint.price.amount.raw),
            mint.price.currency.decimals,
          )} ${mint.price.currency.symbol}`}
        </Text>
        {endTimeDisplay && (
          <Text opacity={0.6} fontWeight="500">
            {` · ${endTimeDisplay}`}
          </Text>
        )}
      </XStack>
    </YStack>
  );
};

const NftListing = ({ nft, ask }: { nft: SimpleHashNFT; ask: NftAsk }) => {
  const [endTimeDisplay, setEndTimeDisplay] = useState<string | undefined>();

  useEffect(() => {
    if (ask.validUntil) {
      const timer = setInterval(() => {
        const currentTime = new Date().getTime();
        const endTimeDate = new Date(ask.validUntil * 1000).getTime();
        const timeLeft = endTimeDate - currentTime;

        if (timeLeft <= 0) {
          clearInterval(timer);
          setEndTimeDisplay("Mint ended");
        } else {
          const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
          const seconds = Math.floor((timeLeft / 1000) % 60);
          setEndTimeDisplay(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
    setEndTimeDisplay(undefined);
  }, [ask.validUntil]);

  return (
    <YStack gap="$2">
      <LinkButton href={ask.source.url}>
        <Text fontWeight="600" fontSize="$5" color="$color1">
          {"Buy "}
          <ExternalLink color="$color1" size={16} strokeWidth={2.5} />
        </Text>
      </LinkButton>
      <XStack justifyContent="center">
        <Text opacity={0.6} fontWeight="500">
          {`${formatUnits(
            BigInt(ask.price.amount.raw),
            ask.price.currency.decimals,
          )} ${ask.price.currency.symbol}`}
        </Text>
        {endTimeDisplay && (
          <Text opacity={0.6} fontWeight="500">
            {` · ${endTimeDisplay}`}
          </Text>
        )}
      </XStack>
    </YStack>
  );
};
