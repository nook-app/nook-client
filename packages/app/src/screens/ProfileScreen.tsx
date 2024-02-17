import { Button, Text, View, XStack, YStack } from "tamagui";
import { useAuth } from "@/context/auth";
import { Image } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export default function ProfilePage() {
  const { session, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const tabHeight = useBottomTabBarHeight();

  return (
    <YStack
      flex={1}
      justifyContent="space-between"
      alignItems="center"
      backgroundColor="$background"
      theme="gray"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom + tabHeight,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {session && (
        <>
          <View flexGrow={1} alignItems="center" justifyContent="center">
            <XStack gap="$2" alignItems="center">
              <Image
                source={{
                  width: 40,
                  height: 40,
                  uri: session.entity.farcaster?.pfp,
                }}
                borderRadius="$10"
              />
              <YStack>
                <Text fontWeight="700" fontSize="$5">
                  {session.entity.farcaster?.displayName}
                </Text>
                <Text color="$gray11" fontSize="$4">
                  {`@${session.entity.farcaster?.username}`}
                </Text>
              </YStack>
            </XStack>
          </View>
          <View padding="$5" paddingVertical="$2" width="100%">
            <Button
              onPress={() => {
                signOut();
              }}
              theme="purple"
            >
              Sign Out
            </Button>
          </View>
        </>
      )}
    </YStack>
  );
}
