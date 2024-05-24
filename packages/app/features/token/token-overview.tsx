"use client";

import { Token } from "@nook/common/types";
import { CdnAvatar } from "../../components/cdn-avatar";
import { GradientIcon } from "../../components/gradient-icon";
import { Text, XStack, YStack, View, ScrollView } from "@nook/app-ui";
import { CHAINS_BY_NAME } from "../../utils/chains";
import { ChainIcon } from "../../components/blockchain/chain-icon";
import { formatNumber, formatPrice } from "../../utils";
import { TokenChart } from "./token-chart";
import { useState } from "react";

export const TokenOverview = ({
  token,
  color,
}: { token: Token; color: string }) => {
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

  return (
    <YStack gap="$6">
      <XStack
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal="$4"
      >
        <XStack alignItems="center" gap="$3">
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
          <YStack gap="$1.5">
            <Text fontSize="$8" fontWeight="600">
              {token.name}
            </Text>
            <TokenHeaderChains token={token} />
          </YStack>
        </XStack>
        {focused?.value ? (
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
      {stats.length > 0 && (
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
      )}
      {token.description && (
        <View paddingHorizontal="$4">
          <Text fontWeight="600" fontSize="$5">
            Description
          </Text>
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
      )}
    </YStack>
  );
};

const TokenHeaderChains = ({ token }: { token: Token }) => {
  const chains = token.instances.map((instance) => instance.chainId);
  const chainDatas = chains
    .map((chainId) => CHAINS_BY_NAME[chainId])
    .sort((a, b) => a.chainId - b.chainId);

  if (chains.length === 1) {
    return (
      <XStack gap="$1.5" alignItems="center">
        <ChainIcon chainId={chainDatas[0]?.crossChainId} />
        <Text opacity={0.8}>{chainDatas[0]?.name || chains[0]}</Text>
      </XStack>
    );
  }

  return (
    <XStack gap="$2" alignItems="center">
      <XStack>
        {chainDatas
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
