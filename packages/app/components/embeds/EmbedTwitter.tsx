import { Image, NookText, View, XStack, YStack } from "@nook/app-ui";
import { UrlContentResponse } from "@nook/common/types";
import { Link } from "solito/link";
import { formatToCDN } from "../../utils";

export const EmbedTwitter = ({
  content,
}: {
  content: UrlContentResponse;
}) => {
  if (!content.metadata) return null;
  return (
    <Link href={content.uri}>
      <YStack
        borderWidth="$0.5"
        borderColor="$borderColorBg"
        borderRadius="$4"
        padding="$2.5"
        gap="$2"
      >
        <XStack gap="$1" alignItems="center">
          {content.metadata.image && (
            <View marginRight="$1">
              <Image
                source={{
                  width: 16,
                  height: 16,
                  uri: formatToCDN(content.metadata.image),
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
              {content.metadata.title}
            </NookText>
          </View>
        </XStack>
        <NookText>{content.metadata.description}</NookText>
      </YStack>
    </Link>
  );
};
