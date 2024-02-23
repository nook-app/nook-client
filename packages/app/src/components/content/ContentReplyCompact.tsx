import { Content, PostData } from "@nook/common/types";
import { View } from "tamagui";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { ContentPostContent } from "./ContentPostCompact";
import { useContent } from "@/hooks/useContent";

export const ContentReplyCompact = ({
  content,
}: { content: Content<PostData> }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
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
              contentId: parentContent.contentId,
            })
          }
        >
          <ContentPostContent
            content={parentContent as Content<PostData>}
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
        <ContentPostContent content={content} />
      </TouchableWithoutFeedback>
    </View>
  );
};
