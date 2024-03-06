import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { Text, View } from "tamagui";

export const ContentQuotesScreen = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, "FarcasterCastQuotes">>();

  return (
    <View backgroundColor="$background" height="100%">
      <Text>Quotes</Text>
    </View>
  );
};
