import { useLocalSearchParams } from "expo-router";
import { FarcasterCastLikes } from "@nook/app/features/farcaster/cast-screen/cast-likes";
import { View } from "@nook/app-ui";

export default function CastLikesScreen() {
  const { hash } = useLocalSearchParams();
  return (
    <View flexGrow={1} backgroundColor="$color1">
      <FarcasterCastLikes hash={hash as string} />
    </View>
  );
}
