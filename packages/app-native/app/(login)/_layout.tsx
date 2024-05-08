import { Button, useTheme } from "@nook/app-ui";
import { Stack, router } from "expo-router";
import { ArrowLeft } from "@tamagui/lucide-icons";

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
            <Button
              icon={ArrowLeft}
              width="$2"
              height="$2"
              padding="$0"
              borderRadius="$10"
              scaleIcon={1.25}
              onPress={router.back}
            />
          ),
          headerStyle: {
            backgroundColor: "transparent",
          },
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
