"use client";

import { NookText, Text, View, XStack, YStack } from "@nook/app-ui";
import { FarcasterUserAvatar } from "../../components/farcaster/users/user-display";
import { formatAddress, formatNumber, formatTimeAgo } from "../../utils";
import { FarcasterPowerBadge } from "../../components/farcaster/users/power-badge";
import { ChainBadge } from "../../components/blockchain/chain-badge";
import { TransactionMenu } from "./tranasction-menu";
import {
  ContextAction,
  ContextActionVariables,
  Erc1155Variables,
  Erc20Variables,
  Erc721Variables,
  EthVariables,
  MultipleERC721sVariables,
  NumberVariables,
  Transaction,
} from "@nook/common/types";
import { CHAINS } from "@nook/common/utils";
import { TransactionDisplayNFT } from "./transaction-display-nft";
import { Link } from "../../components/link";
import { formatEther, formatUnits } from "viem";
import { CdnAvatar } from "../../components/cdn-avatar";
import { GradientIcon } from "../../components/gradient-icon";
import { ChevronDown } from "@tamagui/lucide-icons";
import { ChainIcon } from "../../components/blockchain/chain-icon";

export const TransactionDisplay = ({
  transaction,
}: {
  transaction: Transaction;
}) => {
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
      padding="$2.5"
    >
      <YStack alignItems="center" width="$4" marginTop="$1">
        <FarcasterUserAvatar user={user} size="$4" asLink={!!user} />
      </YStack>
      <YStack flex={1} gap="$2">
        <YStack gap="$1.5">
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
                  } · ${formatTimeAgo(transaction.timestamp * 1000)}`}
                </NookText>
              </XStack>
            )}
            {!user && (
              <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                <NookText
                  fontWeight="700"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {formatAddress(transaction.from)}
                </NookText>
                <NookText
                  muted
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  flexShrink={1}
                >
                  {`· ${formatTimeAgo(transaction.timestamp * 1000)}`}
                </NookText>
              </XStack>
            )}
            <TransactionMenu transaction={transaction} />
          </XStack>
          <TransactionContent transaction={transaction} />
        </YStack>
        <XStack justifyContent="space-between" alignItems="center">
          <View />
          <View>
            <ChainBadge chainId={`eip155:${transaction.chainId}`} />
          </View>
        </XStack>
      </YStack>
    </XStack>
  );
};

const TransactionContent = ({ transaction }: { transaction: Transaction }) => {
  const action = Object.values(transaction.context.variables).find(
    (v) => v?.type === "contextAction",
  ) as ContextActionVariables | undefined;

  if (!action) {
    return null;
  }

  switch (action.value) {
    case ContextAction.MINTED:
      return <TransactionContentMint transaction={transaction} />;
    case ContextAction.SWAPPED:
      return <TransactionContentSwap transaction={transaction} />;
    default:
      return <TransactionContentLegacy transaction={transaction} />;
  }
};

const TransactionContentSwap = ({
  transaction,
}: {
  transaction: Transaction;
}) => {
  const swapFromContext = transaction.context.variables.swapFrom as
    | Erc20Variables
    | EthVariables
    | undefined;
  const swapToContext = transaction.context.variables.swapTo as
    | Erc20Variables
    | EthVariables
    | undefined;

  if (!swapFromContext || !swapToContext) {
    return null;
  }

  const swapFromToken =
    swapFromContext.type === "erc20"
      ? transaction.tokens[swapFromContext.contract]
      : {
          id: "eth",
          name: "Ethereum",
          symbol: "ETH",
          icon: {
            url: "https://cdn.zerion.io/eth.png",
          },
          instances: [{ decimals: 18 }],
        };

  const swapToToken =
    swapToContext.type === "erc20"
      ? transaction.tokens[swapToContext.contract]
      : {
          id: "eth",
          name: "Ethereum",
          symbol: "ETH",
          icon: {
            url: "https://cdn.zerion.io/eth.png",
          },
          instances: [{ decimals: 18 }],
        };

  const swapFromAmount = formatNumber(
    parseFloat(
      formatUnits(
        BigInt(swapFromContext.value),
        swapFromToken.instances[0].decimals,
      ),
    ),
    2,
  );

  const swapToAmount = formatNumber(
    parseFloat(
      formatUnits(
        BigInt(swapToContext.value),
        swapToToken.instances[0].decimals,
      ),
    ),
    2,
  );

  return (
    <YStack>
      <Text lineHeight={20} selectable paddingBottom="$2">
        <Text
          textTransform="capitalize"
          fontWeight="600"
          fontSize={15}
          color="$mauve12"
        >
          {"Swapped "}
        </Text>
        <Text fontSize={15} color="$mauve12">
          {`${swapFromAmount} ${swapFromToken.symbol} for ${swapToAmount} ${swapToToken.symbol}`}
        </Text>
      </Text>
      <Link href={`/tokens/${swapFromToken.id}`} touchable>
        <XStack
          padding="$2.5"
          alignItems="center"
          borderRadius="$4"
          backgroundColor="$color2"
          justifyContent="space-between"
          gap="$3"
        >
          <XStack gap="$3" alignItems="center" flexShrink={1}>
            {swapFromToken.icon?.url ? (
              <CdnAvatar
                src={swapFromToken.icon.url}
                size="$3"
                skipCdn
                borderRadius="$10"
              />
            ) : (
              <GradientIcon
                label={swapFromToken.name}
                size="$3"
                borderRadius="$10"
              >
                <Text fontSize="$1" numberOfLines={1} fontWeight="500">
                  {swapFromToken.name}
                </Text>
              </GradientIcon>
            )}
            <Text
              fontWeight="600"
              fontSize="$5"
              numberOfLines={1}
              flexShrink={1}
              ellipsizeMode="tail"
            >
              {swapFromToken.name}
            </Text>
          </XStack>

          <Text fontSize="$4" color="$mauve11">
            {`-${swapFromAmount} ${swapFromToken.symbol}`}
          </Text>
        </XStack>
      </Link>
      <View alignSelf="center" paddingVertical="$1">
        <ChevronDown />
      </View>
      <Link href={`/tokens/${swapToToken.id}`} touchable>
        <XStack
          padding="$2.5"
          alignItems="center"
          borderRadius="$4"
          backgroundColor="$color2"
          justifyContent="space-between"
          gap="$3"
        >
          <XStack gap="$3" alignItems="center" flexShrink={1}>
            {swapToToken.icon?.url ? (
              <CdnAvatar
                src={swapToToken.icon.url}
                size="$3"
                skipCdn
                borderRadius="$10"
              />
            ) : (
              <GradientIcon
                label={swapToToken.name}
                size="$3"
                borderRadius="$10"
              >
                <Text fontSize="$1" numberOfLines={1} fontWeight="500">
                  {swapToToken.name}
                </Text>
              </GradientIcon>
            )}
            <Text
              fontWeight="600"
              fontSize="$5"
              numberOfLines={1}
              flexShrink={1}
              ellipsizeMode="tail"
            >
              {swapToToken.name}
            </Text>
          </XStack>
          <Text fontSize="$4" color="$green11">
            {`+${swapToAmount} ${swapToToken.symbol}`}
          </Text>
        </XStack>
      </Link>
    </YStack>
  );
};

const TransactionContentMint = ({
  transaction,
}: { transaction: Transaction }) => {
  const chain = CHAINS[`eip155:${transaction.chainId}`];
  const tokenContext = transaction.context.variables.token as
    | Erc721Variables
    | Erc1155Variables;

  if (!tokenContext) {
    return <TransactionContentMultiMint transaction={transaction} />;
  }

  const assetId = `${chain.simplehashId}.${tokenContext.token}.${tokenContext.tokenId}`;
  const asset = transaction.collectibles[assetId];

  const price = transaction.context.variables.price as
    | EthVariables
    | Erc20Variables
    | undefined;

  const quantity = parseInt("value" in tokenContext ? tokenContext.value : "1");

  const amount =
    price?.type === "eth"
      ? parseFloat(formatUnits(BigInt(price.value), 18))
      : 0;

  if (!asset) {
    return null;
  }

  return (
    <YStack gap="$2">
      <Text lineHeight={20} selectable>
        <Text
          textTransform="capitalize"
          fontWeight="600"
          fontSize={15}
          color="$mauve12"
        >
          {"Minted "}
        </Text>
        {quantity > 1 && (
          <Text color="$mauve12" fontSize={15}>{`${quantity}x `}</Text>
        )}
        <Link href={`/collectibles/${assetId}`} asText>
          <Text color="$mauve12" fontSize={15}>
            {asset.name || asset.collection.name}
          </Text>
        </Link>
        {amount > 0 && (
          <Text color="$mauve12" fontSize={15}>
            {` for ${
              amount === 0.000777 ? amount : formatNumber(amount, 2)
            } ETH`}
          </Text>
        )}
      </Text>
      <Link href={`/collectibles/${assetId}`} touchable>
        <TransactionDisplayNFT nft={asset} />
      </Link>
    </YStack>
  );
};

const TransactionContentMultiMint = ({
  transaction,
}: {
  transaction: Transaction;
}) => {
  const multipleTokenContext = transaction.context.variables.multipleERC721s as
    | MultipleERC721sVariables
    | undefined;
  if (!multipleTokenContext) {
    return null;
  }

  const assets = Object.values(transaction.collectibles).filter(Boolean);
  if (assets.length === 0) {
    return null;
  }

  const collection = assets[0].collection;
  const price = transaction.context.variables.price as
    | EthVariables
    | Erc20Variables
    | undefined;

  const quantity = transaction.context.variables.amount as NumberVariables;

  const amount =
    price?.type === "eth"
      ? parseFloat(formatUnits(BigInt(price.value), 18))
      : 0;

  return (
    <YStack gap="$2">
      <Text lineHeight={20} selectable>
        <Text
          textTransform="capitalize"
          fontWeight="600"
          fontSize={15}
          color="$mauve12"
        >
          {"Minted "}
        </Text>
        <Text
          color="$mauve12"
          fontSize={15}
        >{`${quantity.value}${quantity.unit} `}</Text>
        <Link href={`/collections/${collection.collection_id}`} asText>
          <Text color="$mauve12" fontSize={15}>
            {collection.name}
          </Text>
        </Link>
        {amount > 0 && (
          <Text color="$mauve12" fontSize={15}>
            {` for ${
              amount === 0.000777 ? amount : formatNumber(amount, 2)
            } ETH`}
          </Text>
        )}
      </Text>
      {assets.map((asset) => (
        <Link
          href={`/collectibles/${asset.nft_id}`}
          touchable
          key={asset.nft_id}
        >
          <XStack
            padding="$2.5"
            alignItems="center"
            borderRadius="$4"
            backgroundColor="$color2"
            gap="$3"
          >
            {asset.previews.image_medium_url && (
              <CdnAvatar
                src={asset.previews.image_medium_url}
                size="$4"
                skipCdn
                borderRadius="$4"
              />
            )}
            <Text fontWeight="600" fontSize="$5" numberOfLines={1}>
              {asset.name}
            </Text>
          </XStack>
        </Link>
      ))}
    </YStack>
  );
};

const TransactionContentLegacy = ({
  transaction,
}: { transaction: Transaction }) => {
  const textParts = [];

  const { summaries, variables } = transaction.context;
  const summary = summaries.en.default;

  // Split the summary into parts by variables and static text
  const parts = summary.split(/\[\[([^\]]+)\]\]/);

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      if (parts[i]) {
        textParts.push(
          <NookText key={`text-${i}`} color="$mauve12">
            {parts[i]}{" "}
          </NookText>,
        );
      }
    } else {
      if (i === 1) {
        continue;
      }

      const variable = variables[parts[i]];
      if (!variable) {
        return <NookText> {summary}</NookText>;
      }

      if (variable.type === "contextAction") {
        textParts.push(
          <NookText
            key={`var-${i}`}
            color="$mauve12"
            fontWeight="600"
            textTransform="capitalize"
          >
            {variable.value.replace("_", " ").toLowerCase()}{" "}
          </NookText>,
        );
        continue;
      }

      if (variable.type === "eth") {
        textParts.push(
          <NookText key={`var-${i}`} color="$mauve12" whiteSpace="nowrap">
            {`${(+formatEther(BigInt(variable.value))).toFixed(4)} ETH`}{" "}
          </NookText>,
        );
        continue;
      }

      if (variable.type === "degen") {
        textParts.push(
          <NookText key={`var-${i}`} color="$mauve12" whiteSpace="nowrap">
            {`${(+formatEther(BigInt(variable.value))).toFixed(4)} DEGEN`}{" "}
          </NookText>,
        );
        continue;
      }

      if (variable.type === "address") {
        if (transaction.users[variable.value]) {
          const user = transaction.users[variable.value];
          textParts.push(
            <View display="inline-flex">
              <Link asText href={`/users/${user.username}`}>
                <NookText>
                  <CdnAvatar src={user.pfp} size="$0.8" />{" "}
                  <NookText fontWeight="600">{`${
                    user.displayName || user.username || `!${user.fid}`
                  } `}</NookText>
                  <FarcasterPowerBadge
                    badge={user.badges?.powerBadge ?? false}
                  />{" "}
                </NookText>
              </Link>
            </View>,
          );
          continue;
        }

        textParts.push(
          <NookText key={`var-${i}`} color="$mauve12" whiteSpace="nowrap">
            {formatAddress(variable.value)}{" "}
          </NookText>,
        );
        continue;
      }

      if (variable.type === "erc1155" && "token" in variable) {
        const id = `${variable.token}-${variable.tokenId}`;
        const asset = transaction.assetsEnriched[id];

        textParts.push(
          <NookText key={id}>
            <NookText color="$mauve12">{variable.value} </NookText>
            {asset && (
              <>
                <CdnAvatar src={asset.imageUrl} size="$0.8" absolute />{" "}
              </>
            )}
            <NookText color="$mauve12">{`${formatAddress(
              variable.token,
            )} `}</NookText>
          </NookText>,
        );
        continue;
      }

      if (variable.type === "erc721" && "token" in variable) {
        const id = `${variable.token}-${variable.tokenId}`;
        const asset = transaction.assetsEnriched[id];

        textParts.push(
          <NookText key={id}>
            {asset && (
              <>
                <CdnAvatar src={asset.imageUrl} size="$0.8" absolute />{" "}
              </>
            )}
            {variable.tokenId && (
              <NookText color="$mauve12">{`${`${formatAddress(
                variable.token,
              )} #${
                variable.tokenId.length > 7
                  ? formatAddress(variable.tokenId)
                  : variable.tokenId
              }`} `}</NookText>
            )}
            {!variable.tokenId && (
              <NookText color="$mauve12">{`${formatAddress(
                variable.token,
              )} `}</NookText>
            )}
          </NookText>,
        );
        continue;
      }

      if (variable.type === "erc20" && "token" in variable) {
        const token = transaction.tokens[variable.token || variable.contract];
        textParts.push(
          <NookText key={variable.token || variable.contract}>
            <NookText color="$mauve12">
              {formatNumber(
                +(+formatUnits(
                  BigInt(variable.value),
                  token?.instances[0]?.decimals ?? 18,
                )).toFixed(4),
              )}{" "}
            </NookText>
            <NookText color="$mauve12" textTransform="uppercase">
              {`${
                token.symbol ||
                formatAddress(variable.token || variable.contract)
              }`}{" "}
            </NookText>
          </NookText>,
        );
        continue;
      }

      if (variable.type === "number" && "unit" in variable) {
        textParts.push(
          <NookText
            key={`var-${i}`}
            color="$mauve12"
            fontWeight={variable.emphasis ? "600" : "400"}
          >
            {`${formatNumber(+variable.value)} ${variable.unit}`}{" "}
          </NookText>,
        );
        continue;
      }

      if (variable.type === "chainID") {
        const chain = CHAINS[`eip155:${variable.value}`];
        if (chain) {
          textParts.push(
            <>
              <NookText>
                <ChainIcon chainId={`eip155:${variable.value}`} />{" "}
              </NookText>
              <NookText>{`${chain.name} `}</NookText>
            </>,
          );
        } else {
          textParts.push(
            <NookText key={`var-${i}`} color="$mauve12">
              {variable.value}{" "}
            </NookText>,
          );
        }
        continue;
      }

      if (variable.type === "transaction") {
        textParts.push(
          <Link
            asText
            key={`var-${i}`}
            href={`https://www.onceupon.xyz/${variable.value}`}
            target="_blank"
          >
            <NookText
              key={`var-${i}`}
              color="$mauve12"
              hoverStyle={{
                textDecorationLine: "underline",
              }}
            >
              {formatAddress(variable.value)}{" "}
            </NookText>
          </Link>,
        );
        continue;
      }

      if (variable.type === "link" && "link" in variable) {
        textParts.push(
          <Link asText key={`var-${i}`} href={variable.link} target="_blank">
            <NookText
              key={`var-${i}`}
              color="$mauve12"
              hoverStyle={{
                textDecorationLine: "underline",
              }}
              fontWeight={variable.emphasis ? "600" : "400"}
            >
              {variable.truncate
                ? formatAddress(variable.value)
                : variable.value}{" "}
            </NookText>
          </Link>,
        );
        continue;
      }

      if ("value" in variable) {
        textParts.push(
          <NookText
            key={`var-${i}`}
            color="$mauve12"
            fontWeight={
              "emphasis" in variable && variable.emphasis ? "600" : "400"
            }
          >
            {variable.value}{" "}
          </NookText>,
        );
      }
    }
  }

  return (
    <NookText lineHeight={20} color="$mauve12" fontSize={15}>
      {textParts}
    </NookText>
  );
};
