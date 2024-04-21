import { FarcasterCast } from "../../types";
import { Text, View } from "@nook/ui";

export const FarcasterCastScreen = ({ cast }: { cast: FarcasterCast }) => {
  return (
    <View>
      <Text>{JSON.stringify(cast)}</Text>
    </View>
  );
};
