import { UrlContentResponse } from "@nook/common/types";
import { Image } from "expo-image";
import { Linking } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Text, View, YStack } from "tamagui";

export const EmbedUrl = ({ content }: { content: UrlContentResponse }) => {
  if (!content.metadata) return null;

  return (
    <TouchableOpacity onPress={() => Linking.openURL(content.uri)}>
      <YStack
        borderRadius="$2"
        overflow="hidden"
        onPress={() => Linking.openURL(content.uri)}
      >
        {content.metadata.image && (
          <View flex={1} height="$14">
            <Image
              source={{ uri: content.metadata.image }}
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </View>
        )}
        <YStack gap="$1" padding="$2" backgroundColor="$color4">
          <Text fontWeight="700" fontSize="$3">
            {content.metadata.title}
          </Text>
          <Text numberOfLines={2} fontSize="$2">
            {content.metadata.description}
          </Text>
        </YStack>
      </YStack>
    </TouchableOpacity>
  );
};
