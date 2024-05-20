import { AnimatePresence, View } from "@nook/app-ui";
import { Display, FarcasterCastResponse } from "@nook/common/types";
import { FarcasterCastResponseDisplay } from "./cast-display";
import { Link } from "../../link";

export const FarcasterCastLink = ({
  cast,
  displayMode,
}: { cast: FarcasterCastResponse; displayMode: Display }) => {
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
      >
        <Link href={`/casts/${cast.hash}`}>
          <FarcasterCastResponseDisplay cast={cast} displayMode={displayMode} />
        </Link>
      </View>
    </AnimatePresence>
  );
};
