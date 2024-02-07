import { View } from "tamagui";
import { Feed } from "../../../../../../components/feed";
import { useLocalSearchParams } from "expo-router";
import { TEMPLATE_NOOKS } from "../../../../../../constants/nooks";

export default function FeedScreen() {
  const { nookId, feedId } = useLocalSearchParams();
  const nook = TEMPLATE_NOOKS.find((nook) => nook.id === nookId);
  if (!nook) return null;
  const feed = nook.feeds.find((feed) => feed.id === feedId);
  if (!feed) return null;
  return (
    <View backgroundColor="$background" theme="pink" height="100%">
      <Feed filter={feed.filter} />
    </View>
  );
}
