import { Entity, PostData } from "@flink/common/types";
import { Linking } from "react-native";
import { Text } from "tamagui";
import { Buffer } from "buffer";

const isWarpcastUrl = (url: string) => {
  return (
    /^https:\/\/warpcast\.com\/[a-zA-Z0-9]+\/0x[a-fA-F0-9]+$/.test(url) ||
    /^https:\/\/warpcast\.com\/~\/conversations\/0x[a-fA-F0-9]+$/.test(url)
  );
};

export function formatTimeAgo(date: string) {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000,
  );
  let interval = seconds / 86400; // Days

  if (interval > 30) {
    const dateObj = new Date(date);
    return `${dateObj.toLocaleString("default", {
      month: "short",
    })} ${dateObj.getDate()}`;
  }
  if (interval > 1) {
    return `${Math.floor(interval)}d`;
  }
  interval = seconds / 3600; // Hours
  if (interval > 1) {
    return `${Math.floor(interval)}h`;
  }
  interval = seconds / 60; // Minutes
  if (interval > 1) {
    return `${Math.floor(interval)}m`;
  }

  return `${Math.floor(seconds)}s`; // Seconds
}

export function formatTipsAmount(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
}

export const PostContent = ({
  data,
  entityMap,
}: {
  data: PostData;
  entityMap: Record<string, Entity>;
}) => {
  const textParts = [];

  const textBuffer = Buffer.from(data.text.replaceAll(/\uFFFC/g, ""), "utf-8");

  const splitLinkParts = (text: string, index: number) => {
    const splitParts: React.JSX.Element[] = [];

    if (text.length === 0) return splitParts;

    const parts = text.split(/(https?:\/\/[^\s]+)/g).reverse();

    let skippedEmbed = false;
    for (let i = 0; i < parts.length; i++) {
      let part = parts[i];
      if (!part) continue;

      if (data.embeds.includes(part) || isWarpcastUrl(part)) {
        skippedEmbed = true;
        continue;
      }

      if (skippedEmbed) {
        part = part.trimEnd();
        skippedEmbed = false;
      }

      if (/https?:\/\/[^\s]+/.test(part)) {
        splitParts.push(
          <Text
            key={`${data.contentId}-${index}-${i}-${part}`}
            color="$color10"
            onPress={() => Linking.openURL(part)}
          >
            {part}
          </Text>,
        );
      } else {
        splitParts.push(
          <Text key={`${data.contentId}-${index}-${i}-${part}`}>{part}</Text>,
        );
      }
    }
    return splitParts;
  };

  let index = textBuffer.length;
  const sortedMentions = [...data.mentions].sort(
    (a, b) => b.position - a.position,
  );
  for (const mention of sortedMentions) {
    const mentionedEntity = entityMap[mention.entityId.toString()];
    const label = `@${
      mentionedEntity?.farcaster?.username ||
      mentionedEntity?.farcaster?.fid ||
      mention.entityId.toString()
    }`;

    textParts.push(
      ...splitLinkParts(
        textBuffer.slice(mention.position, index).toString("utf-8"),
        index,
      ),
    );
    textParts.push(
      <Text
        key={`${data.contentId}-${mention.position}-${label}`}
        color="$color10"
      >
        {label}
      </Text>,
    );
    index = mention.position;
  }

  if (index > 0) {
    textParts.push(
      ...splitLinkParts(textBuffer.slice(0, index).toString("utf-8"), index),
    );
  }

  if (textParts.length === 0) {
    return null;
  }

  textParts.reverse();

  return <Text>{textParts}</Text>;
};
