import { Linking } from "react-native";
import { Text, View } from "tamagui";
import { Buffer } from "buffer";
import { selectEntityById } from "@/store/slices/entity";
import { store } from "@/store";
import { isWarpcastUrl } from "@/utils";
import { TouchableOpacity } from "react-native-gesture-handler";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { FarcasterCastResponseWithContext } from "@nook/common/types";

export const FarcasterCastText = ({
  cast,
}: {
  cast: FarcasterCastResponseWithContext;
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const state = store.getState();

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

      if (cast.urlEmbeds.includes(part) || isWarpcastUrl(part)) {
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
            key={`${cast.hash}-${index}-${i}-${part}`}
            color="$color10"
            onPress={() => Linking.openURL(part)}
          >
            {part}
          </Text>,
        );
      } else {
        splitParts.push(
          <Text key={`${cast.hash}-${index}-${i}-${part}`}>{part}</Text>,
        );
      }
    }
    return splitParts;
  };

  let index = textBuffer.length;
  const sortedMentions = [...cast.mentions].sort(
    (a, b) => Number(b.position) - Number(a.position),
  );
  for (const mention of sortedMentions) {
    const mentionedEntity = selectEntityById(state, mention.entity.id);
    const farcaster = mentionedEntity?.farcaster;
    const label = `@${
      farcaster?.username || farcaster?.fid || mention.entity.id
    }`;

    textParts.push(
      ...splitLinkParts(
        textBuffer.slice(Number(mention.position), index).toString("utf-8"),
        index,
      ),
    );
    textParts.push(
      <TouchableOpacity
        key={`${cast.hash}-${mention.position}-${label}`}
        onPress={() =>
          navigation.navigate("Entity", { entityId: mention.entity.id })
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

  return <Text>{textParts}</Text>;
};
