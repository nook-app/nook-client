import { AnimatePresence, View } from "@nook/app-ui";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { FarcasterExpandedCast } from "@nook/app/features/farcaster/cast-screen/cast-expanded";
import { useCast } from "@nook/app/hooks/useCast";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Loading } from "@nook/app/components/loading";
import { useCallback, useState } from "react";

export default function CastScreen() {
  const { hash } = useLocalSearchParams();
  const { cast } = useCast(hash as string, true);
  const paddingBottom = useBottomTabBarHeight();
  const [show, setShow] = useState(false);

  useFocusEffect(useCallback(() => setShow(true), []));

  if (!cast) {
    return <Loading />;
  }

  return (
    <View flexGrow={1} backgroundColor="$color1">
      {show && (
        <AnimatePresence>
          <View
            flex={1}
            enterStyle={{
              opacity: 0,
            }}
            exitStyle={{
              opacity: 0,
            }}
            animation="100ms"
            opacity={1}
            scale={1}
            y={0}
          >
            <FarcasterExpandedCast cast={cast} paddingBottom={paddingBottom} />
          </View>
        </AnimatePresence>
      )}
    </View>
  );
}
