"use client";

import {
  AnimatePresence,
  NookText,
  Spinner,
  View,
  XStack,
  YStack,
} from "@nook/ui";
import { useTransactionFeed } from "../../api/transactions";
import { InfiniteScrollList } from "../../components/infinite-scroll-list";
import { Loading } from "../../components/loading";
import {
  FetchTransactionsResponse,
  Transaction,
  TransactionFeedFilter,
} from "../../types";
import {
  FarcasterUserAvatar,
  FarcasterUserTextDisplay,
  FarcasterUserTooltip,
} from "../../components/farcaster/users/user-display";
import {
  formatAddress,
  formatNumber,
  formatTimeAgo,
  stringToTheme,
} from "../../utils";
import { CdnAvatar } from "../../components/cdn-avatar";
import { CHAINS } from "../../utils/chains";
import { KebabMenu, KebabMenuItem } from "../../components/kebab-menu";
import { formatEther, formatUnits } from "viem";
import { FarcasterPowerBadge } from "../../components/farcaster/users/power-badge";
import { TextLink } from "solito/link";
import { useCallback, useState } from "react";
import { EmbedImage } from "../../components/embeds/EmbedImage";

export const TransactionFeed = ({
  filter,
  initialData,
}: {
  filter: TransactionFeedFilter;
  initialData?: FetchTransactionsResponse;
}) => {
  const [chains, setChains] = useState<number[]>([]);
  const { data, isLoading, fetchNextPage, isFetchingNextPage } =
    useTransactionFeed(
      { ...filter, chains: chains.length > 0 ? chains : undefined },
      initialData,
    );

  const casts = data?.pages.flatMap((page) => page.data) ?? [];

  const toggleChain = useCallback((chain: number) => {
    setChains((prev) =>
      prev.includes(chain) ? prev.filter((c) => c !== chain) : [...prev, chain],
    );
  }, []);

  const options = [8453, 7777777, 10, 1].map((c) => CHAINS[c]).filter(Boolean);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View>
      <XStack
        justifyContent="space-around"
        padding="$2"
        borderBottomWidth="$0.5"
        borderColor="$borderColorBg"
      >
        {options.map(({ chainId, name, image }) => (
          <XStack
            key={chainId}
            gap="$1.5"
            borderRadius="$6"
            paddingHorizontal="$2"
            paddingVertical="$1.5"
            borderColor={
              chains.includes(chainId) ? "$color10" : "$borderColorBg"
            }
            borderWidth="$0.5"
            cursor="pointer"
            hoverStyle={{
              // @ts-ignore
              transition: "all 0.2s ease-in-out",
              backgroundColor: "$color4",
            }}
            backgroundColor={chains.includes(chainId) ? "$color5" : undefined}
            onPress={() => toggleChain(chainId)}
          >
            <CdnAvatar src={image} size="$0.8" absolute />
            <NookText
              numberOfLines={1}
              ellipsizeMode="tail"
              fontWeight="500"
              fontSize="$3"
              opacity={chains.includes(chainId) ? 1 : 0.5}
              color={chains.includes(chainId) ? "$color12" : undefined}
            >
              {name}
            </NookText>
          </XStack>
        ))}
      </XStack>
      <InfiniteScrollList
        data={casts}
        renderItem={({ item }) => (
          <AnimatePresence>
            <View
              enterStyle={{
                opacity: 0,
              }}
              exitStyle={{
                opacity: 0,
              }}
              animation="quick"
              opacity={1}
              scale={1}
              y={0}
            >
              <TransactionFeedItem transaction={item as Transaction} />
            </View>
          </AnimatePresence>
        )}
        onEndReached={fetchNextPage}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View marginVertical="$3">
              <Spinner size="small" color="$color9" />
            </View>
          ) : null
        }
      />
    </View>
  );
};

const TransactionFeedItem = ({
  transaction,
}: {
  transaction: Transaction;
}) => {
  // @ts-ignore
  const handlePress = (event) => {
    const selection = window?.getSelection()?.toString();
    if (!selection || selection.length === 0) {
      window.open(`https://www.onceupon.xyz/${transaction.hash}`, "_blank");
    }
  };

  const user = transaction.users[transaction.from];

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
      padding="$3"
      onPress={handlePress}
      borderBottomWidth="$0.5"
      borderBottomColor="$borderColorBg"
    >
      <YStack alignItems="center" width="$4">
        <FarcasterUserAvatar user={user} size="$4" asLink={!!user} />
      </YStack>
      <YStack flex={1} gap="$2">
        <YStack gap="$1.5">
          <XStack justifyContent="space-between">
            {user && (
              <FarcasterUserTextDisplay
                user={user}
                asLink
                suffix={` · ${formatTimeAgo(transaction.timestamp * 1000)}`}
              />
            )}
            {!user && (
              <NookText
                fontWeight="600"
                flexShrink={1}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {formatAddress(transaction.from)}
              </NookText>
            )}
            <View position="absolute" right={0} top={0} marginTop="$-2">
              <KebabMenu>
                <KebabMenuItem
                  Icon={
                    <CdnAvatar
                      size="$1"
                      src="https://www.onceupon.xyz/once-upon-mark.svg"
                      absolute
                    />
                  }
                  title={"View in OnceUpon"}
                  onPress={() =>
                    window.open(
                      `https://www.onceupon.xyz/${transaction.hash}`,
                      "_blank",
                    )
                  }
                />
              </KebabMenu>
            </View>
          </XStack>
          <TransactionText transaction={transaction} />
          <TransactionEmbed transaction={transaction} />
        </YStack>
        <XStack justifyContent="space-between" alignItems="center">
          <View />
          <View>
            <TransactionChainBadge chainId={transaction.chainId} />
          </View>
        </XStack>
      </YStack>
    </XStack>
  );
};

const TransactionText = ({ transaction }: { transaction: Transaction }) => {
  const textParts = [];

  const { summaries, variables } = transaction.context;
  const summary = summaries.en.default;

  // Split the summary into parts by variables and static text
  const parts = summary.split(/\[\[([^\]]+)\]\]/);

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      if (parts[i]) {
        textParts.push(
          <NookText key={`text-${i}`} marginRight="$1.5" color="$mauve12">
            {parts[i]}
          </NookText>,
        );
      }
    } else {
      if (i === 1) {
        continue;
      }

      const variable = variables[parts[i]];
      if (!variable) {
        return <NookText>{summary}</NookText>;
      }

      if (variable.type === "contextAction") {
        const theme = stringToTheme(variable.value);
        textParts.push(
          <NookText
            key={`var-${i}`}
            theme={theme}
            color="$color11"
            backgroundColor="$color3"
            paddingHorizontal="$2"
            paddingVertical="$0.5"
            textTransform="lowercase"
            borderRadius="$10"
            marginRight="$1.5"
            fontWeight="500"
          >
            {variable.value.replaceAll("_", " ")}
          </NookText>,
        );
        continue;
      }

      if (variable.type === "eth") {
        textParts.push(
          <NookText
            key={`var-${i}`}
            color="$mauve12"
            marginRight="$1.5"
            whiteSpace="nowrap"
            fontWeight="600"
          >
            {`${(+formatEther(BigInt(variable.value))).toFixed(4)} ETH`}
          </NookText>,
        );
        continue;
      }

      if (variable.type === "degen") {
        textParts.push(
          <NookText
            key={`var-${i}`}
            color="$mauve12"
            marginRight="$1.5"
            whiteSpace="nowrap"
            fontWeight="600"
          >
            {`${(+formatEther(BigInt(variable.value))).toFixed(4)} DEGEN`}
          </NookText>,
        );
        continue;
      }

      if (variable.type === "address") {
        if (transaction.users[variable.value]) {
          const user = transaction.users[variable.value];
          textParts.push(
            <FarcasterUserTooltip
              user={transaction.users[variable.value]}
              key={`var-${i}`}
            >
              <View display="inline-flex" marginRight="$1.5">
                <TextLink href={`/users/${user.username}`}>
                  <XStack alignItems="center" gap="$1.5" cursor="pointer">
                    <CdnAvatar src={user.pfp} size="$0.8" />
                    <NookText fontWeight="600">{`${
                      user.displayName || user.username || `!${user.fid}`
                    } `}</NookText>
                    <FarcasterPowerBadge
                      badge={user.badges?.powerBadge ?? false}
                    />
                  </XStack>
                </TextLink>
              </View>
            </FarcasterUserTooltip>,
          );
          continue;
        }

        const enrichedParty = transaction.enrichedParties?.[
          variable.value
        ]?.find(({ ensNew }) => ensNew);
        if (enrichedParty?.ensNew?.handle) {
          textParts.push(
            <NookText
              key={`var-${i}`}
              color="$mauve12"
              marginRight="$1.5"
              whiteSpace="nowrap"
              fontWeight="600"
            >
              {enrichedParty.ensNew.handle}
            </NookText>,
          );
          continue;
        }

        if (enrichedParty?.label?.public) {
          textParts.push(
            <NookText
              key={`var-${i}`}
              color="$mauve12"
              marginRight="$1.5"
              whiteSpace="nowrap"
              fontWeight="600"
            >
              {enrichedParty.label.public}
            </NookText>,
          );
          continue;
        }

        textParts.push(
          <NookText
            key={`var-${i}`}
            color="$mauve12"
            marginRight="$1.5"
            whiteSpace="nowrap"
          >
            {formatAddress(variable.value)}
          </NookText>,
        );
        continue;
      }

      if (variable.type === "erc1155") {
        const id = `${variable.token}-${variable.tokenId}`;
        const asset = transaction.assetsEnriched[id];
        const party = transaction.enrichedParties[variable.token]?.find(
          ({ label }) => label,
        );

        textParts.push(
          <XStack
            alignItems="center"
            gap="$1.5"
            display="inline-flex"
            key={id}
            marginRight="$1.5"
          >
            <NookText fontWeight="600" color="$mauve12">
              {variable.value}
            </NookText>
            {asset && <CdnAvatar src={asset.imageUrl} size="$0.8" absolute />}
            <NookText fontWeight="600" color="$mauve12">{`${
              party?.label?.public || formatAddress(variable.token)
            }`}</NookText>
          </XStack>,
        );
        continue;
      }

      if (variable.type === "erc721") {
        const id = `${variable.token}-${variable.tokenId}`;
        const asset = transaction.assetsEnriched[id];
        const party = transaction.enrichedParties[variable.token]?.find(
          ({ label }) => label,
        );

        textParts.push(
          <XStack
            alignItems="center"
            gap="$1.5"
            display="inline-flex"
            key={id}
            marginRight="$1.5"
          >
            {asset && <CdnAvatar src={asset.imageUrl} size="$0.8" absolute />}
            {variable.tokenId && (
              <NookText fontWeight="600" color="$mauve12">{`${
                party?.label?.public
                  ? `${party.label.public} #${
                      variable.tokenId.length > 7
                        ? formatAddress(variable.tokenId)
                        : variable.tokenId
                    }`
                  : `${formatAddress(variable.token)} #${
                      variable.tokenId.length > 7
                        ? formatAddress(variable.tokenId)
                        : variable.tokenId
                    }`
              }`}</NookText>
            )}
            {!variable.tokenId && (
              <NookText fontWeight="600" color="$mauve12">{`${
                party?.label?.public
                  ? `${party.label.public}`
                  : `${formatAddress(variable.token)}`
              }`}</NookText>
            )}
          </XStack>,
        );
        continue;
      }

      if (variable.type === "erc20") {
        const id = `${variable.token}-${variable.tokenId}`;
        const party = transaction.enrichedParties[variable.token]?.find(
          ({ label }) => label,
        );

        textParts.push(
          <XStack
            alignItems="center"
            gap="$1.5"
            display="inline-flex"
            key={id}
            marginRight="$1.5"
          >
            <NookText fontWeight="600" color="$mauve12">
              {formatNumber(
                +(+formatUnits(
                  BigInt(variable.value),
                  party?.decimals || 18,
                )).toFixed(4),
              )}
            </NookText>
            <NookText
              fontWeight="600"
              color="$mauve12"
              textTransform="uppercase"
            >{`${
              party?.label?.public || formatAddress(variable.token)
            }`}</NookText>
          </XStack>,
        );
        continue;
      }

      if (variable.type === "number") {
        textParts.push(
          <NookText
            key={`var-${i}`}
            color="$mauve12"
            marginRight="$1.5"
            fontWeight={variable.emphasis ? "600" : "400"}
          >
            {`${formatNumber(+variable.value)} ${variable.unit}`}
          </NookText>,
        );
        continue;
      }

      if (variable.type === "chainID") {
        const chain = CHAINS[variable.value as unknown as number];
        if (chain) {
          textParts.push(
            <XStack
              key={`var-${i}`}
              alignItems="center"
              gap="$1.5"
              display="inline-flex"
              marginRight="$1.5"
            >
              <CdnAvatar src={chain.image} size="$0.8" absolute />
              <NookText fontWeight="600">{`${chain.name}`}</NookText>
            </XStack>,
          );
        } else {
          textParts.push(
            <NookText key={`var-${i}`} color="$mauve12" marginRight="$1.5">
              {variable.value}
            </NookText>,
          );
        }
        continue;
      }

      if (variable.type === "transaction") {
        textParts.push(
          <TextLink
            key={`var-${i}`}
            href={`https://www.onceupon.xyz/${variable.value}`}
            target="_blank"
          >
            <NookText
              key={`var-${i}`}
              color="$mauve12"
              marginRight="$1.5"
              hoverStyle={{
                textDecorationLine: "underline",
              }}
            >
              {formatAddress(variable.value)}
            </NookText>
          </TextLink>,
        );
        continue;
      }

      if (variable.type === "link") {
        textParts.push(
          <TextLink key={`var-${i}`} href={variable.link} target="_blank">
            <NookText
              key={`var-${i}`}
              color="$mauve12"
              marginRight="$1.5"
              hoverStyle={{
                textDecorationLine: "underline",
              }}
              fontWeight={variable.emphasis ? "600" : "400"}
            >
              {variable.truncate
                ? formatAddress(variable.value)
                : variable.value}
            </NookText>
          </TextLink>,
        );
        continue;
      }

      textParts.push(
        <NookText
          key={`var-${i}`}
          color="$mauve12"
          marginRight="$1.5"
          fontWeight={variable.emphasis ? "600" : "400"}
        >
          {variable.value}
        </NookText>,
      );
    }
  }

  return (
    <NookText lineHeight={20} color="$mauve12" fontSize={15}>
      {textParts}
    </NookText>
  );
};

const TransactionEmbed = ({ transaction }: { transaction: Transaction }) => {
  if (!transaction.assetsEnriched) return null;
  const asset = Object.values(transaction.assetsEnriched)[0];
  if (!asset?.imageUrl) return null;
  return <EmbedImage uri={`${asset.imageUrl.split("?")[0]}?width=600`} />;
};

const TransactionChainBadge = ({ chainId }: { chainId: number }) => {
  const chain = CHAINS[chainId];

  if (!chain) {
    return null;
  }

  return (
    <XStack
      gap="$1.5"
      alignItems="center"
      flexShrink={1}
      backgroundColor="$color3"
      borderRadius="$6"
      paddingHorizontal="$2"
      paddingVertical="$1.5"
      borderColor="$color7"
      borderWidth="$0.5"
      hoverStyle={{
        // @ts-ignore
        transition: "all 0.2s ease-in-out",
        backgroundColor: "$color4",
      }}
    >
      <CdnAvatar src={chain.image} size="$0.8" absolute />
      <View flexShrink={1}>
        <NookText
          numberOfLines={1}
          ellipsizeMode="tail"
          fontWeight="500"
          fontSize="$3"
        >
          {chain.name}
        </NookText>
      </View>
    </XStack>
  );
};
