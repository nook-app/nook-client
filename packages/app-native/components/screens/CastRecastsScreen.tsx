import { useLocalSearchParams } from "expo-router";
import { FarcasterCastRecasts } from "@nook/app/features/farcaster/cast-screen/cast-recasts";
import { View } from "@nook/app-ui";

export default function CastRecastsScreen() {
  const { hash } = useLocalSearchParams();
  return (
    <View flexGrow={1} backgroundColor="$color1">
      <FarcasterCastRecasts hash={hash as string} />
    </View>
  );
}
