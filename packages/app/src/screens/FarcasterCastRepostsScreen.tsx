import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { Text, View } from "tamagui";

export const ContentRepostsScreen = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, "FarcasterCastReposts">>();

  return (
    <View backgroundColor="$background" height="100%">
      <Text>Reposts</Text>
    </View>
  );
};
