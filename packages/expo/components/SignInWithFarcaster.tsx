import { Spinner, Text, View, YStack } from 'tamagui'
import { StatusAPIResponse, useSignIn } from '@farcaster/auth-kit'
import { useCallback, useEffect, useState } from 'react'
import { Linking } from 'react-native'
import { AppState } from 'react-native'
import { Image } from 'expo-image'
import { SignInParams } from '@/types'
import { Button } from './Button'

export const SignInWithFarcaster = ({
  label,
  onSignIn,
}: {
  label?: string
  onSignIn: (params: SignInParams) => void
}) => {
  const [isSigningIn, setIsSigningIn] = useState(false)

  const [appState, setAppState] = useState(AppState.currentState)

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        isSigningIn &&
        appState.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        startPolling()
      }
      setAppState(nextAppState)
    })

    return () => {
      subscription.remove()
    }
  }, [appState])

  const {
    connect,
    reconnect,
    signIn: startPolling,
    url,
    isError,
    isConnected,
    isPolling,
    data,
    error,
  } = useSignIn({
    onSuccess: useCallback(
      async (req: StatusAPIResponse) => {
        if (!req.message || !req.nonce || !req.signature) {
          return
        }
        try {
          onSignIn({
            message: req.message!,
            nonce: req.nonce!,
            signature: req.signature!,
          })
        } catch (error) {
          alert((error as Error).message)
        }
      },
      [onSignIn]
    ),
    onError: useCallback(() => {
      throw error
    }, []),
  })

  const handlePress = useCallback(async () => {
    setIsSigningIn(true)
    if (isError || isConnected) {
      reconnect()
    } else {
      await connect()
      openURL()
    }
  }, [connect, isError, isConnected, reconnect])

  const openURL = useCallback(async () => {
    if (url) {
      Linking.openURL(url).catch(() => openURL())
    }
  }, [url])

  useEffect(() => {
    openURL()
  }, [url])

  return (
    <YStack gap="$2">
      {isError && (
        <Text color="$red9" textAlign="center" fontWeight="500">
          {JSON.stringify(error?.message)}
        </Text>
      )}
      {data?.state === 'completed' && (
        <Button disabled>
          <View>
            <Spinner />
          </View>
        </Button>
      )}
      {(isSigningIn || isPolling) && data?.state !== 'completed' && (
        <Button onPress={openURL}>
          <View position="absolute" left={12}>
            <Spinner />
          </View>
          <Text fontWeight="500" color="$mauve12">
            Authenticating in Warpcast
          </Text>
        </Button>
      )}
      {!isPolling && !isSigningIn && data?.state !== 'completed' && (
        <Button onPress={handlePress}>
          <View position="absolute" left={12}>
            <Image
              source={require('@/assets/farcaster.webp')}
              style={{ width: 28, height: 28 }}
            />
          </View>
          <Text fontWeight="500" color="$mauve12">
            {label || 'Sign in with Farcaster'}
          </Text>
        </Button>
      )}
    </YStack>
  )
}
