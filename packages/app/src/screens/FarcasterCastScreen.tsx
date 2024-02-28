import { FarcasterCast } from "@/components/farcaster/FarcasterCast";
import { useCast } from "@/hooks/useCast";
import { RootStackParamList } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { View } from "tamagui";

export default function ContentScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "FarcasterCast">>();
  const cast = useCast(route.params.hash);

  return (
    <View backgroundColor="$background" height="100%">
      <FarcasterCast cast={cast} />
    </View>
  );
}
