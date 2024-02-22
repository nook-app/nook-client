import { ContentPost } from "@/components/content/post";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectContentById } from "@/store/slices/content";
import { RootStackParamList } from "@/types";
import { ContentFeedItem } from "@nook/api/types";
import { PostData } from "@nook/common/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { View } from "tamagui";

export default function ContentScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "Content">>();
  const content = useAppSelector((state) =>
    selectContentById(state, route.params.contentId),
  );

  return (
    <View backgroundColor="$background" height="100%">
      <ContentPost item={content as ContentFeedItem<PostData>} />
    </View>
  );
}
