import { UrlContentResponse } from "../../types";
import { Linking } from "react-native";
import { TapGestureHandler } from "react-native-gesture-handler";
import { Text, View, XStack, YStack, Image } from "tamagui";

export const EmbedTwitter = ({
  content,
}: {
  content: UrlContentResponse;
}) => {
  if (!content.metadata) return null;
  return (
    <TapGestureHandler>
      <YStack
        borderWidth="$0.25"
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
            <Text
              fontWeight="600"
              textOverflow="ellipsis"
              numberOfLines={1}
              color="$mauve12"
            >
              {content.metadata.title}
            </Text>
          </View>
        </XStack>
        <Text color="$mauve12">{content.metadata.description}</Text>
      </YStack>
    </TapGestureHandler>
  );
};
