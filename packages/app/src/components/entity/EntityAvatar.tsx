import { Avatar } from "tamagui";
import { useEntity } from "@/hooks/useEntity";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { TouchableOpacity } from "react-native-gesture-handler";

export const EntityAvatar = ({
  entityId,
  size = "$3.5",
}: { entityId: string; size?: string }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { pfp } = useEntity(entityId);
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("Entity", { entityId })}
    >
      <Avatar circular size={size}>
        <Avatar.Image src={pfp} />
        <Avatar.Fallback backgroundColor="$backgroundPress" />
      </Avatar>
    </TouchableOpacity>
  );
};
