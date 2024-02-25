import { Text } from "tamagui";
import { XStack, YStack } from "tamagui";
import { useEntity } from "@/hooks/useEntity";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { TouchableOpacity } from "react-native-gesture-handler";

export const EntityDisplay = ({
  entityId,
  orientation = "horizontal",
  hideDisplayName,
}: {
  entityId: string;
  orientation?: "horizontal" | "vertical";
  hideDisplayName?: boolean;
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { displayName, username } = useEntity(entityId);
  const Stack = orientation === "horizontal" ? XStack : YStack;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("Entity", { entityId })}
    >
      <Stack
        gap="$1"
        alignItems={orientation === "horizontal" ? "center" : "flex-start"}
        justifyContent={orientation === "horizontal" ? "flex-start" : "center"}
      >
        {!hideDisplayName && <Text fontWeight="700">{displayName}</Text>}
        <Text color={hideDisplayName ? "$gray12" : "$gray11"}>{username}</Text>
      </Stack>
    </TouchableOpacity>
  );
};
