import { useLocalSearchParams } from "expo-router";
import { FarcasterCastQuotes } from "@nook/app/features/farcaster/cast-screen/cast-quotes";
import { View } from "@nook/app-ui";

export default function CastQuotesScreen() {
  const { hash } = useLocalSearchParams();
  return (
    <View flexGrow={1} backgroundColor="$color1">
      <FarcasterCastQuotes hash={hash as string} />
    </View>
  );
}
