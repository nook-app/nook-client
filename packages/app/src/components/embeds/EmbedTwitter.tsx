import { UrlContentResponse } from "@nook/common/types";
import { Image } from "expo-image";
import { Text, View, XStack, YStack } from "tamagui";

export const EmbedTwitter = ({
  content,
}: {
  content: UrlContentResponse;
}) => {
  if (!content.metadata) return null;
  return (
    <YStack
      borderWidth="$0.75"
      borderColor="$borderColor"
      borderRadius="$2"
      padding="$2.5"
      marginVertical="$2"
      gap="$2"
    >
      <XStack gap="$1" alignItems="center">
        <View marginRight="$1">
          <Image
            source={{ width: 20, height: 20, uri: content.metadata.image }}
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
            }}
          />
        </View>
        <Text fontWeight="700">{content.metadata.title}</Text>
      </XStack>
      <Text>{content.metadata.description}</Text>
    </YStack>
  );
};
