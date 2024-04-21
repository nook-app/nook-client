import { FarcasterCastResponse } from "@nook/common/types";
import { Text, View } from "@nook/ui";

export const FarcasterCastScreen = ({
  cast,
}: { cast: FarcasterCastResponse }) => {
  return (
    <View>
      <Text>{JSON.stringify(cast)}</Text>
    </View>
  );
};
