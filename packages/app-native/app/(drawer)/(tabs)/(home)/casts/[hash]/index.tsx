import { AnimatePresence, View } from "@nook/app-ui";
import { useLocalSearchParams } from "expo-router";
import { FarcasterExpandedCast } from "@nook/app/features/farcaster/cast-screen/cast-expanded";
import { useCast } from "@nook/app/hooks/useCast";

export default function CastScreen() {
  const { hash } = useLocalSearchParams();
  const { cast } = useCast(hash as string);

  return (
    <View flex={1} backgroundColor="$color1">
      {cast && (
        <AnimatePresence>
          <View
            flex={1}
            enterStyle={{
              opacity: 0,
            }}
            exitStyle={{
              opacity: 0,
            }}
            animation="quick"
            opacity={1}
            scale={1}
            y={0}
          >
            <FarcasterExpandedCast cast={cast} />
          </View>
        </AnimatePresence>
      )}
    </View>
  );
}
