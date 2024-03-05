import { Avatar } from "tamagui";
import { useUser } from "@/hooks/useUser";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { TouchableOpacity } from "react-native-gesture-handler";

export const UserAvatar = ({
  userId,
  size = "$3.5",
}: { userId: string; size?: string }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { pfp } = useUser(userId);
  return (
    <TouchableOpacity onPress={() => navigation.navigate("User", { userId })}>
      <Avatar circular size={size}>
        <Avatar.Image src={pfp} />
        <Avatar.Fallback backgroundColor="$backgroundPress" />
      </Avatar>
    </TouchableOpacity>
  );
};
