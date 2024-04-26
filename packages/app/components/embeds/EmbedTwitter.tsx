import { Linking } from "react-native";
import { Image, NookText, View, XStack, YStack } from "@nook/ui";
import { UrlContentResponse } from "../../types";

export const EmbedTwitter = ({
  content,
}: {
  content: UrlContentResponse;
}) => {
  if (!content.metadata) return null;
  return (
    <YStack
      borderWidth="$0.5"
      borderColor="$borderColor"
      borderRadius="$4"
      padding="$2.5"
      gap="$2"
      onPress={() => Linking.openURL(content.uri)}
    >
      <XStack gap="$1" alignItems="center">
        <View marginRight="$1">
          <Image
            source={{ width: 16, height: 16, uri: content.metadata.image }}
            style={{
              width: 16,
              height: 16,
              borderRadius: 10,
            }}
          />
        </View>
        <View flexShrink={1}>
          <NookText fontWeight="600" textOverflow="ellipsis" numberOfLines={1}>
            {content.metadata.title}
          </NookText>
        </View>
      </XStack>
      <NookText>{content.metadata.description}</NookText>
    </YStack>
  );
};
