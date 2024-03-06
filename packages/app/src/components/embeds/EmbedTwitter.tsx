import { UrlContentResponse } from "@nook/common/types";
import { Image } from "expo-image";
import { Linking } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Text, View, XStack, YStack } from "tamagui";

export const EmbedTwitter = ({
  content,
}: {
  content: UrlContentResponse;
}) => {
  if (!content.metadata) return null;
  return (
    <TouchableOpacity onPress={() => Linking.openURL(content.uri)}>
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
              source={{ width: 16, height: 16, uri: content.metadata.image }}
              style={{
                width: 16,
                height: 16,
                borderRadius: 10,
              }}
            />
          </View>
          <View flexShrink={1}>
            <Text fontWeight="700" textOverflow="ellipsis" numberOfLines={1}>
              {content.metadata.title}
            </Text>
          </View>
        </XStack>
        <Text>{content.metadata.description}</Text>
      </YStack>
    </TouchableOpacity>
  );
};
