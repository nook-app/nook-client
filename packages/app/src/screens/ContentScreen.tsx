import { ContentPost } from "@/components/content/post";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectContentById } from "@/store/content";
import { RootStackParamList } from "@/types";
import { ContentFeedItem } from "@flink/api/types";
import { PostData } from "@flink/common/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { View } from "tamagui";

export default function ContentScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "Content">>();
  const activeNook = useAppSelector((state) => state.user.activeNook);
  const content = useAppSelector((state) =>
    selectContentById(state, route.params.contentId),
  );
  return (
    <View backgroundColor="$background" theme={activeNook.theme} height="100%">
      <ContentPost item={content as ContentFeedItem<PostData>} />
    </View>
  );
}
