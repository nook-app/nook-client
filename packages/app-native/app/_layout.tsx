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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ToastProvider } from "@nook/app-ui";
import { Toasts } from "../components/Toasts";
import { NotificationsProvider } from "@nook/app/context/notifications";

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <PrivyProvider appId={"clsnxqma102qxbyt1ght4j14w"}>
          <AuthProvider>
            <NotificationsProvider>
              <ThemeProvider>
                <SafeAreaProvider>
                  <ScrollProvider>
                    <ToastProvider>
                      <Toasts />
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
                          name="(modals)/image/[url]"
                          options={{
                            headerShown: false,
                            animation: "fade",
                            animationDuration: 100,
                            presentation: "transparentModal",
                            contentStyle: {
                              backgroundColor: "rgba(0, 0, 0, 0.90)",
                            },
                          }}
                        />
                        <Stack.Screen
                          name="(modals)/create/cast"
                          options={{
                            headerShown: false,
                            presentation: "transparentModal",
                          }}
                        />
                        <Stack.Screen
                          name="(modals)/enable-signer"
                          options={{
                            headerShown: false,
                            presentation: "transparentModal",
                          }}
                        />
                      </Stack>
                    </ToastProvider>
                  </ScrollProvider>
                </SafeAreaProvider>
              </ThemeProvider>
            </NotificationsProvider>
          </AuthProvider>
        </PrivyProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
