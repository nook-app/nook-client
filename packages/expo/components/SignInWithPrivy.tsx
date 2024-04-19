import { Spinner, Text, View, YStack } from 'tamagui'
import { Image } from 'expo-image'
import { Button } from './Button'

export const SignInWithPrivy = ({
  label,
  signInState,
  onSignIn,
}: {
  label?: string
  signInState: string
  onSignIn: () => void
}) => {
  const isInitialState = signInState === 'initial'
  const isDoneState = signInState === 'done'
  const isErrorState = signInState === 'error'
  const isLoadingState = !isInitialState && !isDoneState && !isErrorState
  return (
    <YStack gap="$2">
      {signInState === 'error' && (
        <Text color="$red9" textAlign="center" fontWeight="500">
          An error occurred. Try again.
        </Text>
      )}
      {isDoneState && (
        <Button>
          <View position="absolute" left={12}>
            <Spinner />
          </View>
          <Text fontWeight="500" color="$mauve12">
            Loading Account
          </Text>
        </Button>
      )}
      {isLoadingState && (
        <Button disabled>
          <View position="absolute" left={12}>
            <Spinner />
          </View>
          <Text fontWeight="500" color="$mauve12">
            Authenticating
          </Text>
        </Button>
      )}
      {(isInitialState || isErrorState) && (
        <Button onPress={onSignIn}>
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
