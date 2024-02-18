import { Button, Text, View, XStack, YStack } from "tamagui";
import { useAuth } from "@/context/auth";
import { Image } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useAppSelector } from "@/store/hooks/useAppSelector";

export default function ProfilePage() {
  const { signOut } = useAuth();
  const entity = useAppSelector((state) => state.user.entity);
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
      {entity && (
        <>
          <View flexGrow={1} alignItems="center" marginTop="$10">
            <XStack gap="$2" alignItems="center">
              <Image
                source={{
                  width: 40,
                  height: 40,
                  uri: entity.farcaster?.pfp,
                }}
                borderRadius="$10"
              />
              <YStack>
                <Text fontWeight="700" fontSize="$5">
                  {entity.farcaster?.displayName}
                </Text>
                <Text color="$gray11" fontSize="$4">
                  {`@${entity.farcaster?.username}`}
                </Text>
              </YStack>
            </XStack>
          </View>
          <YStack padding="$5" paddingVertical="$2" width="100%" gap="$2">
            <Button
              onPress={() => {
                signOut();
              }}
            >
              Sign Out
            </Button>
          </YStack>
        </>
      )}
    </YStack>
  );
}
