"use client";

import { NookText, View, XStack, YStack } from "@nook/app-ui";
import { Transaction } from "@nook/common/types";
import {
  FarcasterUserAvatar,
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
import { formatEther, formatUnits } from "viem";
import { FarcasterPowerBadge } from "../../components/farcaster/users/power-badge";
import { EmbedImage } from "../../components/embeds/EmbedImage";
import { ChainBadge } from "../../components/blockchain/chain-badge";
import { ChainIcon } from "../../components/blockchain/chain-icon";
import { Link } from "../../components/link";
import { TransactionMenu } from "./tranasction-menu";

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
      <YStack alignItems="center" width="$4">
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
            <ChainBadge chainId={transaction.chainId} />
          </View>
        </XStack>
      </YStack>
    </XStack>
  );
};

const TransactionContent = ({ transaction }: { transaction: Transaction }) => {
  const contextAction = transaction.context.variables
    ? Object.values(transaction.context.variables).find(
        (v) => v.type === "contextAction",
      )
    : undefined;
  const value = contextAction?.value;
  const theme = value ? stringToTheme(value) : undefined;
  return (
    <YStack
      borderWidth="$0.5"
      borderColor="$borderColorBg"
      borderRadius="$4"
      overflow="hidden"
    >
      <View
        theme={theme}
        backgroundColor="$color2"
        borderTopLeftRadius="$4"
        borderTopRightRadius="$4"
        justifyContent="center"
        alignItems="center"
        padding="$1"
      >
        <NookText
          color="$color11"
          textTransform="lowercase"
          fontWeight="600"
          fontSize={15}
        >
          {value?.replaceAll("_", " ") || "unknown"}
        </NookText>
      </View>
      <TransactionEmbed transaction={transaction} />
      <View padding="$2">
        <TransactionText transaction={transaction} />
      </View>
    </YStack>
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
        continue;
      }

      if (variable.type === "eth") {
        textParts.push(
          <NookText
            key={`var-${i}`}
            color="$mauve12"
            whiteSpace="nowrap"
            fontWeight="600"
          >
            {`${(+formatEther(BigInt(variable.value))).toFixed(4)} ETH`}{" "}
          </NookText>,
        );
        continue;
      }

      if (variable.type === "degen") {
        textParts.push(
          <NookText
            key={`var-${i}`}
            color="$mauve12"
            whiteSpace="nowrap"
            fontWeight="600"
          >
            {`${(+formatEther(BigInt(variable.value))).toFixed(4)} DEGEN`}{" "}
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
              whiteSpace="nowrap"
              fontWeight="600"
            >
              {enrichedParty.ensNew.handle}{" "}
            </NookText>,
          );
          continue;
        }

        if (enrichedParty?.label?.public) {
          textParts.push(
            <NookText
              key={`var-${i}`}
              color="$mauve12"
              whiteSpace="nowrap"
              fontWeight="600"
            >
              {enrichedParty.label.public}{" "}
            </NookText>,
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

      if (variable.type === "erc1155") {
        const id = `${variable.token}-${variable.tokenId}`;
        const asset = transaction.assetsEnriched[id];
        const party = transaction.enrichedParties?.[variable.token]?.find(
          ({ label }) => label,
        );

        textParts.push(
          <NookText key={id}>
            <NookText fontWeight="600" color="$mauve12">
              {variable.value}{" "}
            </NookText>
            {asset && (
              <>
                <CdnAvatar src={asset.imageUrl} size="$0.8" absolute />{" "}
              </>
            )}
            <NookText fontWeight="600" color="$mauve12">{`${
              party?.label?.public || formatAddress(variable.token)
            } `}</NookText>
          </NookText>,
        );
        continue;
      }

      if (variable.type === "erc721") {
        const id = `${variable.token}-${variable.tokenId}`;
        const asset = transaction.assetsEnriched[id];
        const party = transaction.enrichedParties?.[variable.token]?.find(
          (x) => x?.label,
        );

        textParts.push(
          <NookText key={id}>
            {asset && (
              <>
                <CdnAvatar src={asset.imageUrl} size="$0.8" absolute />{" "}
              </>
            )}
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
              } `}</NookText>
            )}
            {!variable.tokenId && (
              <NookText fontWeight="600" color="$mauve12">{`${
                party?.label?.public
                  ? `${party.label.public}`
                  : `${formatAddress(variable.token)}`
              } `}</NookText>
            )}
          </NookText>,
        );
        continue;
      }

      if (variable.type === "erc20") {
        const id = `${variable.token}-${variable.tokenId}`;
        const party = transaction.enrichedParties?.[variable.token]?.find(
          (x) => x?.label,
        );

        textParts.push(
          <NookText key={id}>
            <NookText fontWeight="600" color="$mauve12">
              {formatNumber(
                +(+formatUnits(
                  BigInt(variable.value),
                  party?.decimals || 18,
                )).toFixed(4),
              )}{" "}
            </NookText>
            <NookText
              fontWeight="600"
              color="$mauve12"
              textTransform="uppercase"
            >
              {`${party?.label?.public || formatAddress(variable.token)}`}{" "}
            </NookText>
          </NookText>,
        );
        continue;
      }

      if (variable.type === "number") {
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
        const chain = CHAINS[variable.value as unknown as number];
        if (chain) {
          textParts.push(
            <>
              <NookText>
                <ChainIcon chainId={chain.chainId} />{" "}
              </NookText>
              <NookText fontWeight="600">{`${chain.name} `}</NookText>
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

      if (variable.type === "link") {
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

      textParts.push(
        <NookText
          key={`var-${i}`}
          color="$mauve12"
          fontWeight={variable.emphasis ? "600" : "400"}
        >
          {variable.value}{" "}
        </NookText>,
      );
    }
  }

  return (
    <NookText lineHeight={24} color="$mauve12" fontSize={15}>
      {textParts}
    </NookText>
  );
};

const TransactionEmbed = ({ transaction }: { transaction: Transaction }) => {
  if (!transaction.assetsEnriched) return null;
  const asset = Object.values(transaction.assetsEnriched)[0];
  if (!asset?.imageUrl) return null;
  return (
    <EmbedImage
      uri={`${asset.imageUrl.split("?")[0]}?width=600`}
      noBorderRadius
      skipCdn
    />
  );
};
