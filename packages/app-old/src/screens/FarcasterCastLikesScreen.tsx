import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { Text, View } from "tamagui";

export const ContentLikesScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, "FarcasterCastLikes">>();

  return (
    <View backgroundColor="$background" height="100%">
      <Text>Likes</Text>
    </View>
  );
};
