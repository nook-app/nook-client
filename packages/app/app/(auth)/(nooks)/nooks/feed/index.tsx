import { View } from "tamagui";
import { Feed } from "../../../../../components/feed";

export default function FeedScreen() {
  return (
    <View backgroundColor="$background" theme="pink">
      <Feed
        filter={{
          type: "POST",
          deletedAt: null,
          topics: {
            type: "SOURCE_ENTITY",
            value: "65be632f92e36013ae684d7b",
          },
        }}
      />
    </View>
  );
}
