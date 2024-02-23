import { EmbedImage } from "./EmbedImage";
import { EmbedQuote } from "./EmbedQuote";
import { ContentType, PostData, UrlMetadata } from "@nook/common/types";
import { Text } from "tamagui";
import { EmbedFrame } from "./EmbedFrame";
import { Linking } from "react-native";
import { EmbedUrl } from "./EmbedUrl";
import { EmbedTwitter } from "./EmbedTwitter";
import { EmbedVideo } from "./EmbedVideo";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { ContentPostText } from "@/components/content/ContentPostText";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { nookApi } from "@/store/apis/nookApi";
import { useContent } from "@/hooks/useContent";

export const Embed = ({
  data,
  embed,
  disableNestedQuote,
}: {
  data: PostData;
  embed: string;
  disableNestedQuote?: boolean;
}) => {
  const storedContent = useContent(embed);
  const { data: fetchedContent } = nookApi.useGetContentQuery(embed, {
    skip: !!storedContent,
  });

  const content = storedContent || fetchedContent;

  if (content) {
    switch (content.type) {
      case ContentType.POST:
      case ContentType.REPLY: {
        if (disableNestedQuote) {
          return null;
        }
        const data = content.data as PostData;
        return <EmbedQuotePost key={embed} data={data} />;
      }
      case ContentType.URL: {
        const metadata = content.data as UrlMetadata;
        if (
          content.contentId.includes("imgur.com") ||
          metadata.contentType?.startsWith("image/")
        ) {
          return <EmbedImage key={embed} embed={content.contentId} />;
        }

        if (
          metadata.contentType?.startsWith("video/") ||
          metadata.contentType === "application/x-mpegURL"
        ) {
          return <EmbedVideo key={embed} embed={content.contentId} />;
        }

        if (metadata.metadata?.frame) {
          return <EmbedFrame data={data} metadata={metadata} />;
        }

        if (embed.includes("twitter.com") || embed.includes("x.com")) {
          return <EmbedTwitter key={embed} metadata={metadata} />;
        }

        return <EmbedUrl key={embed} embed={embed} metadata={metadata} />;
      }
    }
  }

  return (
    <Text key={embed} onPress={() => Linking.openURL(embed)}>
      {embed}
    </Text>
  );
};

export const EmbedQuotePost = ({
  data,
}: {
  data: PostData;
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <TouchableWithoutFeedback
      onPress={() =>
        navigation.navigate("Content", {
          contentId: data.contentId,
        })
      }
    >
      <EmbedQuote entityId={data.entityId}>
        <ContentPostText data={data} />
        {data.embeds.map((embed) => (
          <Embed key={embed} embed={embed} data={data} disableNestedQuote />
        ))}
      </EmbedQuote>
    </TouchableWithoutFeedback>
  );
};
