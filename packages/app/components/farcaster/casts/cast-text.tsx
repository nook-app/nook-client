import { GetThemeValueForKey } from "@tamagui/core";
import { Buffer } from "buffer";
import { FarcasterCastResponse } from "@nook/common/types";
import { TextLink } from "solito/link";
import { NookText } from "@nook/app-ui";
import { FarcasterUserTooltip } from "../users/user-display";
import { FarcasterChannelTooltip } from "../channels/channel-tooltip";

export const FarcasterCastResponseText = ({
  cast,
  disableLinks,
  color = "$mauve12",
  fontSize = 15,
  selectable,
}: {
  cast: FarcasterCastResponse;
  disableLinks?: boolean;
  color?: string;
  fontSize?: string | number;
  selectable?: boolean;
}) => {
  const textParts = [];

  const textBuffer = Buffer.from(cast.text.replaceAll(/\uFFFC/g, ""), "utf-8");

  const splitLinkParts = (
    text: string,
    index: number,
    trimStart?: boolean,
    trimEnd?: boolean,
  ) => {
    const splitParts: React.JSX.Element[] = [];

    if (text.length === 0) return splitParts;

    const parts = text.split(/(https?:\/\/[^\s]+)/g).reverse();

    let skippedEmbed = false;
    for (let i = 0; i < parts.length; i++) {
      let part = parts[i];
      if (!part) continue;

      if (cast.embeds.some((embed) => embed.uri === part)) {
        if (splitParts.length === 0) {
          skippedEmbed = true;
          continue;
        }
      }

      if (skippedEmbed) {
        part = part.trimEnd();
        skippedEmbed = false;
      }

      if (/https?:\/\/[^\s]+/.test(part) && !disableLinks) {
        splitParts.push(
          <NookText
            key={`${cast.hash}-${index}-${i}-${part}`}
            onPress={(e) => {
              e.stopPropagation();
            }}
          >
            <TextLink href={part} target="_blank">
              <NookText
                color="$color11"
                fontSize={
                  fontSize as
                    | "unset"
                    | GetThemeValueForKey<"fontSize">
                    | undefined
                }
                hoverStyle={{
                  // @ts-ignore
                  textDecoration: "underline",
                }}
              >
                {part}
              </NookText>
            </TextLink>
          </NookText>,
        );
      } else {
        if (trimStart) part = part.trimStart();
        if (trimEnd && splitParts.length === 0) part = part.trimEnd();
        splitParts.push(
          <NookText
            key={`${cast.hash}-${index}-${i}-${part}`}
            color={color}
            fontSize={
              fontSize as "unset" | GetThemeValueForKey<"fontSize"> | undefined
            }
          >
            {part}
          </NookText>,
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
        <FarcasterChannelTooltip
          key={`${cast.hash}-${mention.position}-${label}`}
          channel={mention.channel}
        >
          <NookText
            onPress={(e) => {
              e.stopPropagation();
            }}
          >
            <TextLink href={`/channels/${mention.channel.channelId}`}>
              <NookText
                color="$color11"
                fontSize={
                  fontSize as
                    | "unset"
                    | GetThemeValueForKey<"fontSize">
                    | undefined
                }
                hoverStyle={{
                  // @ts-ignore
                  textDecoration: "underline",
                }}
              >
                {label}
              </NookText>
            </TextLink>
          </NookText>
        </FarcasterChannelTooltip>,
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
        <FarcasterUserTooltip
          user={mention.user}
          key={`${cast.hash}-${mention.position}-${label}`}
        >
          <NookText
            onPress={(e) => {
              e.stopPropagation();
            }}
          >
            <TextLink href={`/users/${mention.user.username}`}>
              <NookText
                color="$color11"
                fontSize={
                  fontSize as
                    | "unset"
                    | GetThemeValueForKey<"fontSize">
                    | undefined
                }
                hoverStyle={{
                  // @ts-ignore
                  textDecoration: "underline",
                }}
              >
                {label}
              </NookText>
            </TextLink>
          </NookText>
        </FarcasterUserTooltip>,
      );
    }
    index = Number(mention.position);
  }

  if (index > 0) {
    textParts.push(
      ...splitLinkParts(
        textBuffer.slice(0, index).toString("utf-8"),
        index,
        true,
        textParts.length === 0,
      ),
    );
  }

  if (textParts.length === 0) {
    return null;
  }

  textParts.reverse();

  return (
    <NookText selectable={selectable} lineHeight={20}>
      {textParts}
    </NookText>
  );
};
