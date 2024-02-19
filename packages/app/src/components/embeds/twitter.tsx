import { UrlMetadata } from "@nook/common/types";
import { Image, Text, View, XStack, YStack } from "tamagui";

export const EmbedTwitter = ({
  metadata,
}: {
  metadata: UrlMetadata;
}) => {
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
            source={{ width: 20, height: 20, uri: metadata.metadata?.image }}
            borderRadius="$10"
          />
        </View>
        <Text fontWeight="700">{metadata.metadata?.title}</Text>
      </XStack>
      <Text>{metadata.metadata?.description}</Text>
    </YStack>
  );
};
