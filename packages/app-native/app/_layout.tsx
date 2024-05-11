import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { ThemeProvider } from "@nook/app/context/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@nook/app/context/auth";
import { PrivyProvider } from "@privy-io/expo";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";
import { ScrollProvider } from "@nook/app/context/scroll";
import { Audio } from "expo-av";

export { ErrorBoundary } from "expo-router";

const queryClient = new QueryClient();

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Regular.otf"),
    InterMedium: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterSemiBold: require("@tamagui/font-inter/otf/Inter-SemiBold.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  }, []);

  useEffect(() => {
    if (interLoaded || interError) {
      SplashScreen.hideAsync();
    }
  }, [interLoaded, interError]);

  if (!interLoaded && !interError) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider appId={"clsnxqma102qxbyt1ght4j14w"}>
        <AuthProvider>
          <ThemeProvider>
            <SafeAreaProvider>
              <ScrollProvider>
                <Stack>
                  <Stack.Screen
                    name="(drawer)"
                    options={{ headerShown: false, animation: "fade" }}
                  />
                  <Stack.Screen
                    name="(login)"
                    options={{
                      headerShown: false,
                      animation: "fade",
                    }}
                  />
                  <Stack.Screen
                    name="modal"
                    options={{ presentation: "modal" }}
                  />
                </Stack>
              </ScrollProvider>
            </SafeAreaProvider>
          </ThemeProvider>
        </AuthProvider>
      </PrivyProvider>
    </QueryClientProvider>
  );
}
