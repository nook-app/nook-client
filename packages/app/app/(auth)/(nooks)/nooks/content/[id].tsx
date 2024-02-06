import { useLocalSearchParams } from "expo-router";
import { View } from "tamagui";
import { useAppSelector } from "../../../../../hooks/useAppSelector";
import { ContentFeedItem } from "@flink/api/types";
import { PostActionData } from "@flink/common/types";
import { ContentPost } from "../../../../../components/content/post";
import { selectContentById } from "../../../../../store/content";

export default function ContentScreen() {
  const { id } = useLocalSearchParams();
  const item = useAppSelector((state) =>
    selectContentById(state, id as string),
  );

  console.log(id, item);

  return (
    <View backgroundColor="$background" theme="pink" height="100%">
      {/* <ContentPost item={item as FeedItem<PostActionData>} /> */}
    </View>
  );
}
