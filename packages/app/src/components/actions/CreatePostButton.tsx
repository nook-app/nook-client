import { RootStackParamList } from "@/types";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Plus } from "@tamagui/lucide-icons";
import { View } from "tamagui";

export const CreatePostButton = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View
      onPress={() => navigation.navigate("CreatePost")}
      position="absolute"
      bottom="$5"
      right="$5"
      zIndex={1}
      borderRadius="$20"
      padding="$3"
      backgroundColor="$color7"
      pressStyle={{
        backgroundColor: "$color8",
        padding: "$2.5",
      }}
      animation="bouncy"
    >
      <Plus size={24} />
    </View>
  );
};
