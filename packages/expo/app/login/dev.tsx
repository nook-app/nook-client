import { Input } from '@/components/Input'
import { useAuth } from '@/context/auth'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Spinner, Text, YStack } from 'tamagui'
import { LinearGradient } from '@tamagui/linear-gradient'
import { Button } from '@/components/Button'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ArrowLeft } from '@tamagui/lucide-icons'
import { useDebouncedNavigate } from '@/hooks/useDebouncedNavigate'

export default function DevLoginScreen() {
  const insets = useSafeAreaInsets()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { signInDev, isLoading, error, nooks } = useAuth()
  const { navigate } = useDebouncedNavigate()

  useEffect(() => {
    if (!nooks || nooks.length === 0) return
    navigate(
      {
        pathname: '/nooks/[nookId]',
        params: { nookId: nooks[0].id },
      },
      {
        replace: true,
      }
    )
  }, [nooks])

  const handleLogin = () => {
    signInDev({ username, password })
  }

  return (
    <LinearGradient
      flex={1}
      colors={['$color3', '$color1']}
      start={[0, 0]}
      end={[1, 1]}
      backgroundColor="$color1"
      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <YStack width="100%" gap="$4" paddingVertical="$5" paddingHorizontal="$3">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="$mauve12" />
        </TouchableOpacity>
        <Input
          label="Username"
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <Input
          label="Password"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button onPress={isLoading ? undefined : handleLogin} disabled={isLoading}>
          {isLoading ? (
            <Spinner />
          ) : (
            <Text fontWeight="600" fontSize="$5">
              Sign in
            </Text>
          )}
        </Button>
        {error && (
          <Text color="$red9" textAlign="center" fontWeight="500">
            {JSON.stringify(error)}
          </Text>
        )}
      </YStack>
    </LinearGradient>
  )
}
