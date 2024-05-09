import { View } from "@nook/app-ui";
import { FarcasterTrendingFeed } from "@nook/app/features/farcaster/cast-feed/trending-feed";

export default function HomeScreen() {
  return (
    <View flex={1} backgroundColor="$color1">
      <FarcasterTrendingFeed />
    </View>
  );
}
