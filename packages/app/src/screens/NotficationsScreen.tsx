import { Text, View, YStack } from "tamagui";

export default function NotificationsScreen() {
  return (
    <View backgroundColor="$background" theme="pink" height="100%">
      <YStack padding="$2" gap="$2">
        <Text>Notifications will go here</Text>
      </YStack>
    </View>
  );
}
