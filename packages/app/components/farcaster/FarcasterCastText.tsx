import { Linking } from "react-native";
import { Text } from "tamagui";
import { GetThemeValueForKey } from "@tamagui/core";
import { Buffer } from "buffer";
import { FarcasterCast } from "../../types";
import { TextLink } from "solito/link";

export const FarcasterCastText = ({
  cast,
  disableLinks,
  color = "$mauve12",
  fontSize = 15,
  selectable,
}: {
  cast: FarcasterCast;
  disableLinks?: boolean;
  color?: string;
  fontSize?: string | number;
  selectable?: boolean;
}) => {
  const textParts = [];

  const textBuffer = Buffer.from(cast.text.replaceAll(/\uFFFC/g, ""), "utf-8");

  const splitLinkParts = (text: string, index: number) => {
    const splitParts: React.JSX.Element[] = [];

    if (text.length === 0) return splitParts;

    const parts = text.split(/(https?:\/\/[^\s]+)/g).reverse();

    let skippedEmbed = false;
    for (let i = 0; i < parts.length; i++) {
      let part = parts[i];
      if (!part) continue;

      if (cast.embeds.some((embed) => embed.uri === part)) {
        skippedEmbed = true;
        continue;
      }

      if (skippedEmbed) {
        part = part.trimEnd();
        skippedEmbed = false;
      }

      if (/https?:\/\/[^\s]+/.test(part) && !disableLinks) {
        splitParts.push(
          <Text
            key={`${cast.hash}-${index}-${i}-${part}`}
            color="$color11"
            onPress={() => Linking.openURL(part)}
            fontSize={
              fontSize as "unset" | GetThemeValueForKey<"fontSize"> | undefined
            }
          >
            {part}
          </Text>,
        );
      } else {
        splitParts.push(
          <Text
            key={`${cast.hash}-${index}-${i}-${part}`}
            color={color}
            fontSize={
              fontSize as "unset" | GetThemeValueForKey<"fontSize"> | undefined
            }
          >
            {part}
          </Text>,
        );
      }
    }
    return splitParts;
  };

  let index = textBuffer.length;
  const sortedMentions = [...cast.mentions, ...cast.channelMentions]
    .sort((a, b) => Number(b.position) - Number(a.position))
    .filter(
      (mention, index, self) =>
        index ===
        self.findIndex((m) => Number(m.position) === Number(mention.position)),
    );
  for (const mention of sortedMentions) {
    if ("channel" in mention) {
      const label = `/${mention.channel.channelId}`;
      textParts.push(
        ...splitLinkParts(
          textBuffer
            .slice(Number(mention.position) + label.length, index)
            .toString("utf-8"),
          index,
        ),
      );
      textParts.push(
        <TextLink
          key={`${cast.hash}-${mention.position}-${label}`}
          href={`/channels/${mention.channel.channelId}`}
        >
          <Text
            color="$color11"
            fontSize={
              fontSize as "unset" | GetThemeValueForKey<"fontSize"> | undefined
            }
          >
            {label}
          </Text>
        </TextLink>,
      );
    } else {
      const label = `@${mention.user.username || "unknown"}`;
      textParts.push(
        ...splitLinkParts(
          textBuffer.slice(Number(mention.position), index).toString("utf-8"),
          index,
        ),
      );
      textParts.push(
        <TextLink
          key={`${cast.hash}-${mention.position}-${label}`}
          href={`/users/${mention.user.username}`}
        >
          <Text
            color="$color11"
            fontSize={
              fontSize as "unset" | GetThemeValueForKey<"fontSize"> | undefined
            }
          >
            {label}
          </Text>
        </TextLink>,
      );
    }
    index = Number(mention.position);
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

  return <Text selectable={selectable}>{textParts}</Text>;
};
