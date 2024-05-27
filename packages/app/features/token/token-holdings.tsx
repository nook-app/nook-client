"use client";

import {
  TokenHolding,
  TokenHoldings as TokenHoldingsType,
  TokensFilter,
} from "@nook/common/types";
import { Popover, Text, View, XStack, YStack } from "@nook/app-ui";
import { CdnAvatar } from "../../components/cdn-avatar";
import { InfiniteFeed } from "../../components/infinite-feed";
import { formatAddress, formatNumber, formatPrice } from "../../utils";
import { CHAINS_BY_NAME } from "../../utils/chains";
import { ChainIcon } from "../../components/blockchain/chain-icon";
import { GradientIcon } from "../../components/gradient-icon";
import { memo, useState } from "react";
import { Loading } from "../../components/loading";
import { Menu } from "../../components/menu/menu";
import { OpenLink } from "../../components/menu/menu-actions";
import { useEns } from "../../hooks/useAddress";
import { Link } from "../../components/link";
import { useTokenHoldings } from "../../hooks/useTokenHoldings";
import { Dropdown } from "../../components/dropdown";

export const TokenHoldings = ({
  filter,
  asTabs,
  paddingTop,
  paddingBottom,
}: {
  filter: TokensFilter;
  asTabs?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
}) => {
  const [sort, setSort] = useState("value");
  const { tokenHoldings, isLoading } = useTokenHoldings(filter.fid);

  if (isLoading) {
    return <Loading />;
  }

  if (!tokenHoldings) {
    return (
      <YStack gap="$4" padding="$4" justifyContent="center" alignItems="center">
        <Text color="$mauve11" textAlign="center">
          No lists found. Create a list to group together users or channels.
        </Text>
      </YStack>
    );
  }

  const sortedData = tokenHoldings.data.sort((a, b) => {
    if (sort === "value") {
      return b.value - a.value;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <InfiniteFeed
      data={sortedData}
      renderItem={({ item }) => (
        <TokenHoldingDisplay token={item as TokenHolding} />
      )}
      asTabs={asTabs}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      ListHeaderComponent={
        <TokenHoldingsHeader
          holdings={tokenHoldings}
          sort={sort}
          onSortChange={setSort}
        />
      }
    />
  );
};

const TokenHoldingsHeader = memo(
  ({
    holdings,
    sort,
    onSortChange,
  }: {
    holdings: TokenHoldingsType;
    sort: string;
    onSortChange: (sort: string) => void;
  }) => {
    return (
      <XStack
        paddingBottom="$2"
        paddingTop="$3"
        paddingHorizontal="$2.5"
        justifyContent="space-between"
        alignItems="center"
      >
        <Menu
          trigger={
            <Popover.Trigger $platform-web={{ cursor: "pointer" }}>
              <XStack gap="$1.5" alignItems="flex-end">
                <Text fontWeight="600">{`$${formatPrice(
                  holdings.totalValue,
                )}`}</Text>
                <Text color="$mauve11">across</Text>
                <Text>
                  <Text fontWeight="600">{holdings.addresses.length}</Text>
                  <Text color="$mauve11">{` wallet${
                    holdings.addresses.length > 1 ? "s" : ""
                  }`}</Text>
                </Text>
              </XStack>
            </Popover.Trigger>
          }
        >
          {holdings.addresses.map((address) => (
            <WalletMenuItem key={address} address={address} />
          ))}
        </Menu>
        <Dropdown
          label="Sort Tokens"
          options={[
            { label: "Value", value: "value" },
            { label: "Alphabetical", value: "alphabetical" },
          ]}
          value={sort}
          onChange={(v) => {
            setTimeout(() => {
              onSortChange(v);
            }, 100);
          }}
        />
      </XStack>
    );
  },
);

const TokenHoldingDisplay = ({ token }: { token: TokenHolding }) => {
  return (
    <Link href={`/tokens/${token.id}`} touchable>
      <XStack
        marginHorizontal="$2"
        marginVertical="$1.5"
        padding="$2.5"
        justifyContent="space-between"
        alignItems="center"
        backgroundColor="$color2"
        borderRadius="$4"
      >
        <XStack alignItems="center" gap="$3" flexShrink={1}>
          {token.icon?.url ? (
            <CdnAvatar src={token.icon?.url} size="$4" skipCdn />
          ) : (
            <GradientIcon label={token.name} size="$4" borderRadius="$10">
              <Text fontSize="$1" numberOfLines={1} fontWeight="500">
                {token.symbol}
              </Text>
            </GradientIcon>
          )}
          <YStack flexShrink={1} gap="$1">
            <Text fontWeight="600" fontSize="$5" numberOfLines={1}>
              {token.name}
            </Text>
            <TokenHoldingChains token={token} />
          </YStack>
        </XStack>
        <YStack gap="$1" alignItems="flex-end" flexShrink={1}>
          <Text fontWeight="600" fontSize="$5">{`$${formatPrice(
            token.value,
          )}`}</Text>
          <Text color="$mauve11" numberOfLines={1}>{`${formatNumber(
            token.quantity.float,
            2,
          )} ${token.symbol?.split(" ")[0]}`}</Text>
        </YStack>
      </XStack>
    </Link>
  );
};

const TokenHoldingChains = ({ token }: { token: TokenHolding }) => {
  const chains = Array.from(
    new Set(token.instances.map((instance) => instance.chainId)),
  );
  const chainDatas = chains.map((chainId) => CHAINS_BY_NAME[chainId]);

  if (chains.length === 1) {
    return (
      <XStack gap="$1.5" alignItems="center">
        <ChainIcon chainId={chainDatas[0]?.crossChainId} />
        <Text color="$mauve11">{chainDatas[0]?.name || chains[0]}</Text>
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
      <Text color="$mauve11">{`${chains.length} chains`}</Text>
    </XStack>
  );
};

const WalletMenuItem = ({ address }: { address: string }) => {
  const { data } = useEns(address, true);
  return (
    <OpenLink
      Icon={
        <CdnAvatar
          size="$1"
          src="https://www.onceupon.xyz/once-upon-mark.svg"
          absolute
        />
      }
      title={data?.ens || formatAddress(address)}
      link={`https://www.onceupon.xyz/${address}`}
    />
  );
};
