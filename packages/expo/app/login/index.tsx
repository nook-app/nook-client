import { Spinner, Text, View, YStack } from 'tamagui'
import { useAuth } from '@/context/auth'
import { CONFIG } from '@/constants'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Device from 'expo-device'
import { useFlags } from '@/hooks/useFlags'
import { User } from '@tamagui/lucide-icons'
import { useEffect } from 'react'
import { LinearGradient } from '@tamagui/linear-gradient'
import { DebouncedLink } from '@/components/DebouncedLink'
import { Button } from '@/components/Button'
import { useDebouncedNavigate } from '@/hooks/useDebouncedNavigate'
import { SignInWithPrivy } from '@/components/SignInWithPrivy'

export default function Home() {
  const { flags } = useFlags()
  const { nooks, isLoading, signInPrivy, signInPrivyState, session } = useAuth()
  const insets = useSafeAreaInsets()
  const { navigate } = useDebouncedNavigate()

  useEffect(() => {
    if (!nooks || nooks.length === 0 || !nooks[0].id) return
    navigate(
      {
        pathname: '/(default)/(home)/nooks/[nookId]',
        params: { nookId: nooks[0].id },
      },
      {
        replace: true,
      }
    )
  }, [nooks])

  return (
    <LinearGradient
      flex={1}
      colors={['$color3', '$color1']}
      start={[0, 0]}
      end={[1, 1]}
      justifyContent="space-between"
      alignItems="center"
      backgroundColor="$color1"
      style={{
        paddingBottom: insets.bottom,
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <YStack padding="$3" flexGrow={1} alignItems="center" justifyContent="center">
        <Text fontSize="$12" fontWeight="700" color="$mauve12">
          nook
        </Text>
        <Text color="$mauve12" fontSize="$4" letterSpacing={2}>
          BETA
        </Text>
      </YStack>
      <YStack
        paddingHorizontal="$3"
        width="100%"
        gap="$4"
        position="absolute"
        bottom="$12"
      >
        {isLoading ? (
          <Button>
            <View>
              <Spinner />
            </View>
          </Button>
        ) : !session ? (
          <SignInWithPrivy onSignIn={signInPrivy} signInState={signInPrivyState} />
        ) : (
          <></>
        )}
        {(flags?.reviewMode || (CONFIG.dev && !Device.isDevice)) && !isLoading && (
          <DebouncedLink
            href={{
              pathname: '/login/dev',
            }}
            absolute
          >
            <Button>
              <View position="absolute" left={12}>
                <User size={20} />
              </View>
              Sign in with Password
            </Button>
          </DebouncedLink>
        )}
      </YStack>
    </LinearGradient>
  )
}
