import { Text, View, YStack } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View
      backgroundColor="$background"
      height="100%"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <YStack padding="$2" gap="$2">
        <Text>Notifications will go here</Text>
      </YStack>
    </View>
  );
}
