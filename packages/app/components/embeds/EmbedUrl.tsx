import { Linking } from "react-native";
import { formatToCDN } from "../../utils";
import { UrlContentResponse } from "../../types";
import { Image, NookText, Text, View, XStack, YStack } from "@nook/ui";
import { Link } from "@tamagui/lucide-icons";

export const EmbedUrl = ({ content }: { content: UrlContentResponse }) => {
  if (!content.metadata) return null;

  if (!content.metadata.image) {
    return <EmbedUrlSmall content={content} />;
  }

  return (
    <YStack
      borderRadius="$4"
      borderColor="$borderColor"
      borderWidth="$0.25"
      overflow="hidden"
      onPress={() => Linking.openURL(content.uri)}
    >
      {content.metadata.image && (
        <View flex={1}>
          <View
            position="absolute"
            top={0}
            right={0}
            bottom={0}
            left={0}
            alignItems="center"
            justifyContent="center"
          >
            <Link size={48} color="$mauve12" />
          </View>
          <Image
            source={{ uri: content.metadata.image }}
            style={{
              width: "100%",
              height: "100%",
              aspectRatio: 1.91,
            }}
          />
        </View>
      )}
      <YStack
        gap="$1.5"
        padding="$2"
        borderColor="$borderColor"
        borderTopWidth="$0.25"
        backgroundColor="$color3"
      >
        <NookText fontWeight="600" numberOfLines={1}>
          {content.metadata.title}
        </NookText>
        <NookText numberOfLines={2} fontSize="$4">
          {content.metadata.description}
        </NookText>
        <NookText numberOfLines={1} fontSize="$2" muted>
          {content.host?.replace("www.", "")}
        </NookText>
      </YStack>
    </YStack>
  );
};

const EmbedUrlSmall = ({ content }: { content: UrlContentResponse }) => {
  if (!content.metadata) return null;

  return (
    <XStack
      alignItems="center"
      borderColor="$borderColor"
      borderWidth="$0.25"
      borderRadius="$4"
      overflow="hidden"
      onPress={() => Linking.openURL(content.uri)}
    >
      <View padding="$4" backgroundColor="$color3">
        <Link size={24} color="$mauve12" />
      </View>
      <YStack gap="$1" paddingHorizontal="$3" flexShrink={1}>
        <NookText fontSize="$3" numberOfLines={1}>
          {content.host}
        </NookText>
        {content.metadata.title && (
          <NookText
            fontWeight="600"
            fontSize="$3"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {content.metadata.title}
          </NookText>
        )}
      </YStack>
    </XStack>
  );
};
