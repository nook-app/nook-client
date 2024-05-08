import { View } from "tamagui";
import { ThemeSettings } from "@nook/app/features/settings/theme-settings";
import { useAuth } from "@nook/app/context/auth";
import { FarcasterUserDisplay } from "@nook/app/components/farcaster/users/user-display";
import { NookButton, Text } from "@nook/app-ui";
import { Loading } from "@nook/app/components/loading";
import { Redirect } from "expo-router";

export default function TabOneScreen() {
  const { user, logout } = useAuth();

  return (
    <View flex={1} alignItems="center" backgroundColor="$color1">
      <ThemeSettings />
      {user && <FarcasterUserDisplay user={user} />}
      <NookButton onPress={logout}>Logout</NookButton>
    </View>
  );
}
