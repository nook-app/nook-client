import { AnimatePresence, View } from "@nook/app-ui";
import { Display, FarcasterCastResponse } from "@nook/common/types";
import { useRouter } from "solito/navigation";
import { FarcasterCastResponseDisplay } from "./cast-display";

export const FarcasterCastLink = ({
  cast,
  displayMode,
}: { cast: FarcasterCastResponse; displayMode: Display }) => {
  const router = useRouter();

  // @ts-ignore
  const handlePress = (event) => {
    const selection = window?.getSelection?.()?.toString();
    if (!selection || selection.length === 0) {
      if (event.ctrlKey || event.metaKey) {
        // metaKey is for macOS
        window.open(`/casts/${cast.hash}`, "_blank");
      } else {
        router.push(`/casts/${cast.hash}`);
      }
    }
  };

  return (
    <AnimatePresence>
      <View
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
        onPress={handlePress}
      >
        <FarcasterCastResponseDisplay cast={cast} displayMode={displayMode} />
      </View>
    </AnimatePresence>
  );
};
