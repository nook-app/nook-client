import { ContentType } from "@nook/common/types";
import { ScrollView, View } from "tamagui";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { ContentFeedPanel } from "../panels/ContentFeedPanel";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectChannelById } from "@/store/slices/channel";
import { ContentPostContent } from "./ContentPostCompact";
import { useContent } from "@/hooks/useContent";
import { RootStackParamList } from "@/types";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useEffect, useRef } from "react";
import { ScrollView as RNScrollView, View as RNView } from "react-native";

export const ContentReply = ({ contentId }: { contentId: string }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const contentData = useContent(contentId);
  if (!contentData) return null;
  const { content } = contentData;
  const channel = useAppSelector((state) =>
    content.data.channelId
      ? selectChannelById(state, content.data.channelId)
      : undefined,
  );
  const parentContent = useContent(content.data.parentId);
  const scrollViewRef = useRef<RNScrollView>(null);
  const scrollTargetRef = useRef<RNView>(null);

  useEffect(() => {
    if (scrollViewRef.current && scrollTargetRef.current) {
      setTimeout(() => {
        scrollTargetRef.current?.measureLayout(
          // @ts-ignore
          scrollViewRef.current,
          (left, top, width, height) => {
            scrollViewRef.current?.scrollTo({
              y: top,
              animated: true,
            });
          },
          (error: Error) => {
            console.error(error);
          },
        );
      }, 300);
    }
  }, []);

  return (
    <ScrollView ref={scrollViewRef}>
      <View
        padding="$2"
        borderBottomWidth="0.5"
        borderBottomColor="$borderColor"
      >
        {parentContent && (
          <TouchableWithoutFeedback
            onPress={() =>
              navigation.navigate("Content", {
                contentId: parentContent.content.contentId,
              })
            }
          >
            <ContentPostContent
              contentId={parentContent.content.contentId}
              isParent
            />
          </TouchableWithoutFeedback>
        )}
        <ContentPostContent contentId={content.contentId} />
      </View>
      <ContentFeedPanel
        args={{
          filter: {
            type: ContentType.REPLY,
            "data.parentId": content.data.contentId,
          },
          sort: "engagement.likes",
        }}
        asList
      />
    </ScrollView>
  );
};
