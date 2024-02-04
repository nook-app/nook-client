import { View } from "tamagui";
import { Feed } from "../../components/feed";

export default function FeedScreen() {
  return (
    <View backgroundColor="$background" theme="pink">
      <Feed
        filter={{
          type: "POST",
          deletedAt: null,
        }}
      />
    </View>
  );
}
