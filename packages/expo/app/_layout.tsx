import '@/tamagui-web.css'
import { SplashScreen, Stack, router } from 'expo-router'
import { TamaguiConfig, Theme } from 'tamagui'
import { useFonts } from 'expo-font'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '@/context/auth'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Sheets } from '@/components/sheets/Sheets'
import { SheetProvider } from '@/context/sheet'
import { ToastProvider } from '@tamagui/toast'
import { Toasts } from '@/components/toasts/Toasts'
import { NotificationsProvider } from '@/context/notifications'
import { ThemeProvider, useTheme } from '@/context/theme'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiConfig } from 'wagmi'
import {
  mainnet,
  sepolia,
  base,
  baseSepolia,
  optimism,
  optimismSepolia,
  zora,
  zoraSepolia,
} from 'viem/chains'
import {
  createWeb3Modal,
  defaultWagmiConfig,
  Web3Modal,
} from '@web3modal/wagmi-react-native'
import { handleResponse } from '@coinbase/wallet-mobile-sdk'
import { Linking } from 'react-native'
import { CoinbaseConnector } from '@/utils/connectors/coinbase'
import { Audio } from 'expo-av'
import { ScrollProvider } from '@/context/scroll'
import { ActionsProvider } from '@/context/actions'
import { DrawerProvider } from '@/context/drawer'
import { PrivyProvider } from '@privy-io/expo'

const projectId = '302e299e8d6c292b6aeb9f313321e134'

const metadata = {
  name: 'nook',
  description: 'nook.social',
  url: 'https://nook.social',
  icons: ['https://i.imgur.com/IB6Gn4I.png'],
  redirect: {
    native: 'nook://',
    universal: 'nook.social',
  },
}

const chains = [
  mainnet,
  sepolia,
  base,
  baseSepolia,
  optimism,
  optimismSepolia,
  zora,
  zoraSepolia,
]

const coinbaseConnector = new CoinbaseConnector({
  chains,
  options: {
    redirect: metadata.redirect.native,
  },
})

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  extraConnectors: [coinbaseConnector],
})

createWeb3Modal({
  projectId,
  chains,
  wagmiConfig,
  defaultChain: base,
  featuredWalletIds: [
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
    'c03dfee351b6fcc421b4494ea33b9d4b92a984f87aa76d1663bb28705e95034a', // Uniswap
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // MetaMask
  ],
})

export { ErrorBoundary } from 'expo-router'

const queryClient = new QueryClient()

export const unstable_settings = {
  initialRouteName: '(default)',
}

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Regular.otf'),
    InterMedium: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterSemiBold: require('@tamagui/font-inter/otf/Inter-SemiBold.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useEffect(() => {
    if (interLoaded || interError) {
      SplashScreen.hideAsync()
    }
  }, [interLoaded, interError])

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true })
  }, [])

  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => {
      const handledBySdk = handleResponse(new URL(url))
      if (handledBySdk) {
        router.back()
      }
    })

    return () => sub.remove()
  }, [])

  if (!interLoaded && !interError) {
    return null
  }

  return <RootLayoutNav />
}

function RootLayoutNav() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <WagmiConfig config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <SheetProvider>
            <PrivyProvider appId={'clsnxqma102qxbyt1ght4j14w'}>
              <AuthProvider>
                <ThemeProvider>
                  <SafeAreaProvider>
                    <ToastProvider>
                      <NotificationsProvider>
                        <ScrollProvider>
                          <ActionsProvider>
                            <DrawerProvider>
                              <Components />
                            </DrawerProvider>
                          </ActionsProvider>
                        </ScrollProvider>
                      </NotificationsProvider>
                    </ToastProvider>
                  </SafeAreaProvider>
                </ThemeProvider>
              </AuthProvider>
            </PrivyProvider>
          </SheetProvider>
        </QueryClientProvider>
      </WagmiConfig>
    </GestureHandlerRootView>
  )
}

function Components() {
  const { theme } = useTheme()

  return (
    <Theme name={theme as keyof TamaguiConfig['themes']}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(default)" options={{ headerShown: false }} />
        <Stack.Screen name="login/index" options={{ headerShown: false }} />
        <Stack.Screen name="login/dev" options={{ headerShown: false }} />
        <Stack.Screen
          name="image"
          options={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 100,
            presentation: 'transparentModal',
          }}
        />
        <Stack.Screen
          name="(modals)/create-feed"
          options={{
            title: '',
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen
          name="(modals)/create-nook"
          options={{
            title: '',
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />
      </Stack>
      <Sheets />
      <Toasts />
      <Web3Modal />
    </Theme>
  )
}
