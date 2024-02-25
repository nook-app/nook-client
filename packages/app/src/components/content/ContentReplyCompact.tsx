import { Content, PostData } from "@nook/common/types";
import { View } from "tamagui";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { ContentPostContent } from "./ContentPostCompact";
import { useContent } from "@/hooks/useContent";

export const ContentReplyCompact = ({ contentId }: { contentId: string }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const contentData = useContent(contentId);
  if (!contentData) return null;
  const { content } = contentData;
  const parentContent = useContent(content.data.parentId);
  return (
    <View
      borderBottomWidth="$0.25"
      borderBottomColor="$borderColor"
      padding="$2"
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
            contentId={parentContent.content.data.contentId}
            isParent
          />
        </TouchableWithoutFeedback>
      )}
      <TouchableWithoutFeedback
        onPress={() =>
          navigation.navigate("Content", {
            contentId: content.contentId,
          })
        }
      >
        <ContentPostContent contentId={content.contentId} />
      </TouchableWithoutFeedback>
    </View>
  );
};
