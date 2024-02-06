import { UrlMetadata } from "@flink/common/types";
import { Linking } from "react-native";
import { Image, Text, View, YStack } from "tamagui";

export const EmbedUrl = ({
  embed,
  metadata: { metadata },
}: { embed: string; metadata: UrlMetadata }) => {
  if (!metadata) return null;
  return (
    <YStack
      borderRadius="$2"
      overflow="hidden"
      onPress={() => Linking.openURL(embed)}
    >
      {metadata.image && (
        <View flex={1} height="$14">
          <Image source={{ uri: metadata.image }} width="100%" height="100%" />
        </View>
      )}
      <YStack gap="$1" padding="$2" backgroundColor="$color4">
        <Text fontWeight="700">{metadata.title}</Text>
        <Text>{metadata.description}</Text>
      </YStack>
    </YStack>
  );
};
