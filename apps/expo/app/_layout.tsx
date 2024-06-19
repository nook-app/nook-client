import { SplashScreen, Stack, router } from "expo-router";
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
import { Notifications } from "../components/Notifications";
import { Analytics } from "../components/Analytics";
import { WagmiProvider } from "wagmi";
import { mainnet, arbitrum, base, optimism, zora } from "@wagmi/core/chains";
import {
  createWeb3Modal,
  defaultWagmiConfig,
  Web3Modal,
} from "@web3modal/wagmi-react-native";
import { handleResponse } from "@coinbase/wallet-mobile-sdk";
import { Linking } from "react-native";
import { coinbaseConnector } from "@web3modal/coinbase-wagmi-react-native";

const projectId = "302e299e8d6c292b6aeb9f313321e134";

const metadata = {
  name: "nook",
  description: "nook.social",
  url: "https://nook.social",
  icons: ["https://i.imgur.com/IB6Gn4I.png"],
  redirect: {
    native: "nook://",
    universal: "nook.social",
  },
};

const chains = [arbitrum, mainnet, base, optimism, zora] as const;

const coinbase = coinbaseConnector({
  redirect: metadata.redirect.native,
});

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  extraConnectors: [coinbase],
});

createWeb3Modal({
  projectId,
  wagmiConfig,
  defaultChain: base,
  featuredWalletIds: [
    "1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369", // Rainbow
    "fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa", // Coinbase
    "c03dfee351b6fcc421b4494ea33b9d4b92a984f87aa76d1663bb28705e95034a", // Uniswap
    "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0", // MetaMask
  ],
});

export { ErrorBoundary } from "expo-router";

const queryClient = new QueryClient();

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

  useEffect(() => {
    const sub = Linking.addEventListener("url", ({ url }) => {
      handleResponse(new URL(url));
    });

    return () => sub.remove();
  }, []);

  if (!interLoaded && !interError) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <PrivyProvider appId={"clsnxqma102qxbyt1ght4j14w"}>
            <AuthProvider>
              <ThemeProvider>
                <SafeAreaProvider>
                  <ScrollProvider>
                    <ToastProvider>
                      <Toasts />
                      <Notifications />
                      <Analytics />
                      <Web3Modal />
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
                          name="(modals)/create/list"
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
                        <Stack.Screen
                          name="+not-found"
                          options={{
                            headerShown: false,
                            animation: "fade",
                          }}
                        />
                      </Stack>
                    </ToastProvider>
                  </ScrollProvider>
                </SafeAreaProvider>
              </ThemeProvider>
            </AuthProvider>
          </PrivyProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </GestureHandlerRootView>
  );
}
