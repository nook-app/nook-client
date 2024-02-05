import { useLocalSearchParams } from "expo-router";
import { View } from "tamagui";
import { useAppSelector } from "../../../../../hooks/useAppSelector";
import { selectFeedItemById } from "../../../../../store/feed";
import { FeedItem } from "@flink/api/types";
import { PostActionData } from "@flink/common/types";
import { ActionPost } from "../../../../../components/actions/post";

export default function ContentScreen() {
  const { id } = useLocalSearchParams();
  const item = useAppSelector((state) =>
    selectFeedItemById(state, id as string),
  );

  return (
    <View backgroundColor="$background" theme="pink" height="100%">
      <ActionPost item={item as FeedItem<PostActionData>} />
    </View>
  );
}
