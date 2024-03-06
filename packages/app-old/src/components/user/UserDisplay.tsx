import { Text } from "tamagui";
import { XStack, YStack } from "tamagui";
import { useUser } from "@/hooks/useUser";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { TouchableOpacity } from "react-native-gesture-handler";

export const UserDisplay = ({
  userId,
  orientation = "horizontal",
  hideDisplayName,
}: {
  userId: string;
  orientation?: "horizontal" | "vertical";
  hideDisplayName?: boolean;
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { displayName, username } = useUser(userId);
  const Stack = orientation === "horizontal" ? XStack : YStack;

  return (
    <TouchableOpacity onPress={() => navigation.navigate("User", { userId })}>
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
