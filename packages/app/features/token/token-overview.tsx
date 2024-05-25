"use client";

import { Token } from "@nook/common/types";
import { CdnAvatar } from "../../components/cdn-avatar";
import { GradientIcon } from "../../components/gradient-icon";
import { Text, XStack, YStack, View, ScrollView } from "@nook/app-ui";
import { CHAINS_BY_NAME, ChainWithImage } from "../../utils/chains";
import { ChainIcon } from "../../components/blockchain/chain-icon";
import { formatNumber, formatPrice } from "../../utils";
import { TokenChart } from "./token-chart";
import { useState } from "react";
import { useAuth } from "../../context/auth";
import { useTokenHoldings } from "../../hooks/useTokenHoldings";
import { LinkButton } from "../../components/link";
import { ExternalLink } from "@tamagui/lucide-icons";
import { useQuery } from "@tanstack/react-query";
import { fetchTokenMutualsPreview } from "../../api/token";

export const TokenOverview = ({
  token,
  color,
}: { token: Token; color: string }) => {
  const { session } = useAuth();
  const [focused, setFocused] = useState<
    { timestamp: number; value: number } | undefined
  >(undefined);
  const [percent, setPercent] = useState<number>(token.stats.changes.percent1d);

  const stats = [];

  if (token.stats.marketCap) {
    stats.push({
      label: "Market Cap",
      value: `$${formatNumber(token.stats.marketCap)}`,
    });
  }

  if (token.stats.fullyDilutedValuation) {
    stats.push({
      label: "FDV",
      value: `$${formatNumber(token.stats.fullyDilutedValuation)}`,
    });
  }

  const chains = token.instances.map((instance) => instance.chainId);
  const chainDatas = chains
    .map((chainId) => CHAINS_BY_NAME[chainId])
    .sort((a, b) => a.chainId - b.chainId);

  return (
    <YStack gap="$4" paddingVertical="$4">
      <XStack
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal="$4"
      >
        <XStack alignItems="center" gap="$3" flexShrink={1}>
          <View
            shadowColor="$shadowColor"
            shadowOffset={{ width: 0, height: 0 }}
            shadowOpacity={0.5}
            shadowRadius={10}
            backgroundColor="$color1"
            borderRadius="$12"
          >
            {token.icon?.url ? (
              <CdnAvatar
                src={token.icon?.url}
                size="$5"
                skipCdn
                borderRadius="$12"
              />
            ) : (
              <GradientIcon label={token.name} size="$5" borderRadius="$12">
                <Text fontSize="$5" numberOfLines={1} fontWeight="500">
                  {token.symbol}
                </Text>
              </GradientIcon>
            )}
          </View>
          <YStack gap="$1.5" flexShrink={1}>
            <Text
              fontSize="$8"
              fontWeight="600"
              numberOfLines={1}
              flexShrink={1}
              ellipsizeMode="tail"
            >
              {token.name}
            </Text>
            <TokenHeaderChains chains={chainDatas} />
          </YStack>
        </XStack>
        {focused?.value && focused?.timestamp ? (
          <YStack gap="$1.5" alignItems="flex-end">
            <Text fontSize="$8" fontWeight="600">
              {`$${formatPrice(focused.value)}`}
            </Text>
            <Text fontSize="$6" fontWeight="600">
              {new Date(focused.timestamp).toLocaleString("en-US", {
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </Text>
          </YStack>
        ) : (
          <YStack gap="$1.5" alignItems="flex-end">
            <Text fontSize="$8" fontWeight="600">
              {token.stats.price ? `$${formatPrice(token.stats.price)}` : "N/A"}
            </Text>
            <Text
              fontSize="$6"
              fontWeight="600"
              color={percent > 0 ? "$green11" : "$red11"}
            >
              {percent > 0
                ? `↑ ${percent.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}%`
                : `↓ ${Math.abs(percent).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}%`}
            </Text>
          </YStack>
        )}
      </XStack>
      <TokenChart
        token={token}
        color={color}
        onIndexChange={setFocused}
        onTimeframeChange={setPercent}
      />
      {session?.fid && <TokenHoldings fid={session.fid} token={token} />}
      {/* {stats.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          paddingHorizontal="$4"
        >
          <XStack gap="$4">
            {stats.map(({ label, value }) => (
              <YStack key={label} gap="$1">
                <Text
                  fontWeight="600"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  fontSize="$7"
                >
                  {value}
                </Text>
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
        </ScrollView>
      )} */}
      {token.id !== "eth" && <TokenMutuals tokenId={token.id} />}
      <View paddingHorizontal="$4">
        <LinkButton
          href={`https://app.uniswap.org/#/swap?outputCurrency=${token.instances[0].address}&chain=${chainDatas[0].id}`}
        >
          <Text
            fontWeight="600"
            fontSize="$5"
            color="$color1"
          >{`Swap ${token.symbol} `}</Text>
          <ExternalLink color="$color1" size={16} strokeWidth={2.5} />
        </LinkButton>
      </View>
    </YStack>
  );
};

const TokenHeaderChains = ({ chains }: { chains: ChainWithImage[] }) => {
  if (chains.length === 1) {
    return (
      <XStack gap="$1.5" alignItems="center">
        <ChainIcon chainId={chains[0]?.crossChainId} />
        <Text opacity={0.8}>{chains[0]?.name || chains[0]}</Text>
      </XStack>
    );
  }

  return (
    <XStack gap="$2" alignItems="center">
      <XStack>
        {chains
          .filter(Boolean)
          .slice(0, 3)
          .map((chain) => (
            <View key={chain.crossChainId} marginRight="$-1.5">
              <ChainIcon chainId={chain.crossChainId} />
            </View>
          ))}
      </XStack>
      <Text opacity={0.8}>{`${chains.length} chains`}</Text>
    </XStack>
  );
};

export const TokenDescription = ({ token }: { token: Token }) => {
  if (!token.description) {
    return null;
  }

  return (
    <View paddingHorizontal="$4">
      <Text
        lineHeight={24}
        opacity={0.8}
        fontSize={16}
        color="$color12"
        marginTop="$2"
      >
        {token.description}
      </Text>
    </View>
  );
};

const TokenHoldings = ({ fid, token }: { fid: string; token: Token }) => {
  const { tokenHoldings } = useTokenHoldings(fid);

  const holding = tokenHoldings?.data.find(
    (holding) => holding.id === token.id,
  );
  if (!holding) {
    return null;
  }

  return (
    <XStack
      gap="$4"
      justifyContent="space-between"
      alignItems="center"
      paddingHorizontal="$4"
    >
      <YStack gap="$1">
        <Text
          fontWeight="600"
          numberOfLines={1}
          ellipsizeMode="tail"
          fontSize="$7"
        >
          {`${formatNumber(holding.quantity.float, 2)} ${token.symbol}`}
        </Text>
        <Text
          opacity={0.5}
          fontWeight="600"
          fontSize="$2"
          textTransform="uppercase"
        >
          Balance
        </Text>
      </YStack>
      <YStack gap="$1" alignItems="flex-end">
        <Text
          fontWeight="600"
          numberOfLines={1}
          ellipsizeMode="tail"
          fontSize="$7"
        >
          {`$${formatPrice(holding.value)}`}
        </Text>
        <Text
          opacity={0.5}
          fontWeight="600"
          fontSize="$2"
          textTransform="uppercase"
        >
          Value
        </Text>
      </YStack>
    </XStack>
  );
};

export const TokenMutuals = ({ tokenId }: { tokenId: string }) => {
  const { session } = useAuth();
  const { data } = useQuery({
    queryKey: ["tokenMutualsPreview", tokenId],
    queryFn: async () => {
      return await fetchTokenMutualsPreview(tokenId);
    },
    enabled: !!session?.fid,
  });

  if (!session || !data) return null;

  const total = data?.total || 0;
  const previews = data?.preview || [];
  const other = total - previews.length;

  let label = "Not owned by anyone you’re following";

  switch (previews.length) {
    case 3:
      if (other > 0) {
        label = `Owned by ${previews[0].username}, ${
          previews[1].username
        }, and ${other} other${other > 1 ? "s" : ""} you follow`;
      } else {
        label = `Owned by ${previews[0].username}, ${previews[1].username}, and ${previews[2].username}`;
      }
      break;
    case 2:
      label = `Owned by ${previews[0].username} and ${previews[1].username}`;
      break;
    case 1:
      label = `Owned by ${previews[0].username}`;
  }

  return (
    <XStack
      gap="$3"
      alignItems="center"
      cursor="pointer"
      group
      paddingHorizontal="$4"
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
  );
};
