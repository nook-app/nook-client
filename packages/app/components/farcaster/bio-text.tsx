import { Buffer } from "buffer";
import { TextLink } from "solito/link";
import { NookText } from "@nook/ui";

export const FarcasterBioText = ({
  text,
  selectable,
}: { text: string; selectable?: boolean }) => {
  const textParts = [];

  const textBuffer = Buffer.from(text.replaceAll(/\uFFFC/g, ""), "utf-8");

  const splitLinkParts = (partText: string, index: number) => {
    if (partText.length === 0) return [];

    const urlRegex =
      /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9]+(?:[-_][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}(?::\d{1,5})?(?:\/[^\s]*)?/gi;

    const matches = partText.match(urlRegex);
    if (!matches) return [<NookText key={index}>{partText}</NookText>];

    const result = [];
    let endIndex = partText.length;
    for (const [i, url] of matches.reverse().entries()) {
      const index = partText.lastIndexOf(url) + url.length;
      const nonUrlPart = partText.slice(index, endIndex);

      if (nonUrlPart !== "") {
        result.push(
          <NookText key={`${index}-${i}-${nonUrlPart}`}>{nonUrlPart}</NookText>,
        );
      }

      result.push(
        <TextLink key={`${index}-${i}-${url}`} href={url}>
          <NookText
            color="$color11"
            fontWeight="500"
            hoverStyle={{
              // @ts-ignore
              textDecoration: "underline",
            }}
          >
            {url}
          </NookText>
        </TextLink>,
      );

      endIndex = index - url.length;
    }

    if (endIndex > 0) {
      const remainingText = partText.slice(0, endIndex);
      if (remainingText.trim() !== "") {
        result.push(
          <NookText key={`${index}-${remainingText}`}>
            {remainingText}
          </NookText>,
        );
      }
    }

    return result;
  };

  const words = text.split(/\s+/);

  const channelMentions = words.reduce(
    (acc, word) => {
      const matchWord = word.match(/^\//)?.[0];
      const cleanWord = word.match(/^\/([\w-]+)/)?.[0];
      if (matchWord && cleanWord) {
        const position = Buffer.from(
          text.slice(0, text.indexOf(cleanWord, acc.lastIndex)),
        ).length;
        acc.mentions.push({ word: cleanWord, position });
        acc.lastIndex = position + matchWord.length;
      }
      return acc;
    },
    { mentions: [], lastIndex: 0 } as {
      mentions: { word: string; position: number }[];
      lastIndex: number;
    },
  ).mentions;

  const mentions = words.reduce(
    (acc, word) => {
      const cleanWord = word.match(/^@(\w+(?:\.eth)?)\b/)?.[0];
      if (cleanWord) {
        const position = Buffer.from(
          text.slice(0, text.indexOf(cleanWord, acc.lastIndex)),
        ).length;
        acc.mentions.push({ word: cleanWord, position, isUser: true });
        acc.lastIndex = position + cleanWord.length;
      }
      return acc;
    },
    { mentions: [], lastIndex: 0 } as {
      mentions: { word: string; position: number; isUser: boolean }[];
      lastIndex: number;
    },
  ).mentions;

  let index = textBuffer.length;
  const sortedMentions = [...mentions, ...channelMentions]
    .sort((a, b) => Number(b.position) - Number(a.position))
    .filter(
      (mention, index, self) =>
        index ===
        self.findIndex((m) => Number(m.position) === Number(mention.position)),
    );
  for (const mention of sortedMentions) {
    if (mention.word.startsWith("/")) {
      textParts.push(
        ...splitLinkParts(
          textBuffer
            .slice(Number(mention.position) + mention.word.length, index)
            .toString("utf-8"),
          index,
        ),
      );
      textParts.push(
        <TextLink
          key={`${mention.position}-${mention.word}`}
          href={`/channels/${mention.word.slice(1)}`}
        >
          <NookText
            color="$color11"
            fontWeight="500"
            hoverStyle={{
              // @ts-ignore
              textDecoration: "underline",
            }}
          >
            {mention.word}
          </NookText>
        </TextLink>,
      );
    } else {
      textParts.push(
        ...splitLinkParts(
          textBuffer
            .slice(Number(mention.position) + mention.word.length, index)
            .toString("utf-8"),
          index,
        ),
      );

      textParts.push(
        <TextLink
          key={`${mention.position}-${mention.word}`}
          href={`/users/${mention.word.slice(1)}`}
        >
          <NookText
            color="$color11"
            fontWeight="500"
            hoverStyle={{
              // @ts-ignore
              textDecoration: "underline",
            }}
          >
            {mention.word}
          </NookText>
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

  return <NookText selectable={selectable}>{textParts}</NookText>;
};
