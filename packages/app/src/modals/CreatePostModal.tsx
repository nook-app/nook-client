import { Button, Text, View, YStack } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";

export const CreatePostModal = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  return (
    <YStack
      flex={1}
      justifyContent="flex-end"
      alignItems="center"
      backgroundColor="$background"
      theme="gray"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <View flexGrow={1} padding="$5" justifyContent="center" gap="$2">
        <Text fontSize="$8" fontWeight="700">
          Create Post
        </Text>
      </View>
      <YStack padding="$5" width="100%" gap="$2">
        <Button onPress={() => navigation.goBack()}>Go back</Button>
      </YStack>
    </YStack>
  );
};
