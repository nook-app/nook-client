import { PostData } from "@nook/common/types";
import { Linking } from "react-native";
import { Text, View } from "tamagui";
import { Buffer } from "buffer";
import { selectEntityById } from "@/store/slices/entity";
import { store } from "@/store";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setActiveEntityModal } from "@/store/slices/navigator";
import { TouchableOpacity } from "react-native-gesture-handler";

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
  let div = Math.floor((amount / 1000000) * 100) / 100;
  if (div >= 1) {
    return `${div}M`;
  }
  div = Math.floor((amount / 1000) * 10) / 10;
  if (div >= 1) {
    return `${div}K`;
  }
  return amount.toString();
}

export const PostContent = ({
  data,
}: {
  data: PostData;
}) => {
  const dispatch = useAppDispatch();
  const state = store.getState();
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
    const mentionedEntity = selectEntityById(
      state,
      mention.entityId.toString(),
    );
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
      <TouchableOpacity
        key={`${data.contentId}-${mention.position}-${label}`}
        onPress={() =>
          dispatch(setActiveEntityModal(mention.entityId.toString()))
        }
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            marginBottom: -2.5,
          }}
        >
          <Text color="$color10">{label}</Text>
        </View>
      </TouchableOpacity>,
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
