import { Button, useTheme } from "@nook/app-ui";
import { Stack, router } from "expo-router";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { IconButton } from "../../components/IconButton";

export default function LoginLayout() {
  const theme = useTheme();
  return (
    <Stack>
      <Stack.Screen name="login/index" options={{ headerShown: false }} />
      <Stack.Screen
        name="login/dev"
        options={{
          title: "Sign in with Password",
          headerLeft: () => (
            <IconButton icon={ArrowLeft} onPress={router.back} />
          ),
          headerStyle: {
            backgroundColor: theme.background.val,
          },
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
