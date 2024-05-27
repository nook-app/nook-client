import { Image, NookText, View, XStack, YStack } from "@nook/app-ui";
import { UrlContentResponse } from "@nook/common/types";
import { EmbedImage } from "./EmbedImage";
import { Link } from "../link";

export const EmbedTwitter = ({
  content,
}: {
  content: UrlContentResponse;
}) => {
  if (!content.metadata) return null;

  return (
    <Link href={content.uri} isExternal>
      <YStack
        borderWidth="$0.5"
        borderColor="$borderColorBg"
        borderRadius="$4"
        padding="$2"
        gap="$2"
      >
        <XStack gap="$1" alignItems="center">
          {content.metadata.logo && (
            <View marginRight="$1">
              <Image
                source={{
                  width: 16,
                  height: 16,
                  uri: content.metadata.logo,
                }}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 10,
                }}
              />
            </View>
          )}
          <View flexShrink={1}>
            <NookText
              fontWeight="600"
              textOverflow="ellipsis"
              numberOfLines={1}
            >
              {content.metadata.title?.replace(" on X", "")}
            </NookText>
          </View>
        </XStack>
        <NookText>{content.metadata.description}</NookText>
        {content.metadata.image && <EmbedImage uri={content.metadata.image} />}
      </YStack>
    </Link>
  );
};
