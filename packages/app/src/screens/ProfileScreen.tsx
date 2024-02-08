import { Button, Text, View, XStack, YStack } from "tamagui";
import { useAuth } from "@/context/auth";
import { Image } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfilePage() {
  const { session, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View
      backgroundColor="$background"
      theme="gray"
      height="100%"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <YStack padding="$2" gap="$2">
        <XStack gap="$2" alignItems="center">
          <Image
            source={{
              width: 40,
              height: 40,
              uri: session?.entity?.farcaster?.pfp,
            }}
            borderRadius="$10"
          />
          <YStack>
            <Text fontWeight="700" fontSize="$5">
              {session?.entity?.farcaster?.displayName}
            </Text>
            <Text color="$gray11" fontSize="$4">
              {`@${session?.entity?.farcaster?.username}`}
            </Text>
          </YStack>
        </XStack>
        <Button
          onPress={() => {
            signOut();
          }}
        >
          Sign Out
        </Button>
      </YStack>
    </View>
  );
}
