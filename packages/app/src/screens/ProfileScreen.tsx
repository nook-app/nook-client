import { Button, Text, View, XStack, YStack } from "tamagui";
import { useAuth } from "@/context/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppSelector } from "@/hooks/useAppSelector";
import { UserAvatar } from "@/components/user/UserAvatar";
import { UserDisplay } from "@/components/user/UserDisplay";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setTheme } from "@/store/slices/auth";

export const ThemeSelector = () => {
  const dispatch = useAppDispatch();
  const themes = [
    "blue",
    "gray",
    "green",
    "orange",
    "pink",
    "purple",
    "red",
    "yellow",
  ];
  return (
    <YStack gap="$2">
      <Text
        color="$gray11"
        fontSize="$1"
        fontWeight="700"
        textTransform="uppercase"
      >
        SELECT THEME
      </Text>
      <XStack gap="$2">
        {themes.map((theme) => (
          <TouchableOpacity
            key={theme}
            onPress={() => dispatch(setTheme(theme))}
          >
            <View
              theme={theme}
              backgroundColor="$color5"
              width="$3"
              height="$3"
              borderRadius="$10"
              borderWidth="$1"
              borderColor="$color7"
            />
          </TouchableOpacity>
        ))}
      </XStack>
    </YStack>
  );
};

export const ProfileScreen = () => {
  const { signOut } = useAuth();
  const user = useAppSelector((state) => state.auth.user);
  const insets = useSafeAreaInsets();

  if (!user) return null;

  return (
    <YStack
      flexGrow={1}
      backgroundColor="$background"
      minHeight="100%"
      justifyContent="flex-end"
      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <View
        flexGrow={1}
        borderTopStartRadius="$6"
        borderTopEndRadius="$6"
        paddingHorizontal="$3"
        paddingVertical="$4"
        justifyContent="space-between"
      >
        <YStack gap="$4">
          <XStack gap="$2" alignItems="center">
            <UserAvatar userId={user.fid} size="$5" />
            <UserDisplay userId={user.fid} orientation="vertical" />
          </XStack>
          <ThemeSelector />
        </YStack>
        <YStack padding="$5" paddingVertical="$2" width="100%" gap="$2">
          <Button
            onPress={() => {
              signOut();
            }}
          >
            Sign Out
          </Button>
        </YStack>
      </View>
    </YStack>
  );
};
