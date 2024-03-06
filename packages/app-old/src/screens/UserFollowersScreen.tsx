import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { Text, View } from "tamagui";

export const UserFollowersScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, "UserFollowers">>();

  return (
    <View backgroundColor="$background" height="100%">
      <Text>Followers</Text>
    </View>
  );
};
