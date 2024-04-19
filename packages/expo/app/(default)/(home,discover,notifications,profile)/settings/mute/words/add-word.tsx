import { ArrowLeft } from '@tamagui/lucide-icons'
import { Stack, router } from 'expo-router'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { Text, View } from 'tamagui'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useAuth } from '@/context/auth'
import { useQueryClient } from '@tanstack/react-query'
import { useToastController } from '@tamagui/toast'
import { muteWord } from '@/utils/api'
import { haptics } from '@/utils/haptics'
import { User } from '@/types'
import { Input } from '@/components/Input'
import { useState } from 'react'

export default function MuteWordsSettingsScreen() {
  const height = useBottomTabBarHeight()
  const [word, setWord] = useState<string>('')
  const { user, session } = useAuth()
  const queryClient = useQueryClient()
  const toast = useToastController()

  const handleMuteWord = async () => {
    try {
      await muteWord(word)
      queryClient.setQueryData<User>(['authUser', session?.fid], (data) => {
        if (!data) return
        if (data.mutedWords.includes(word)) return data
        return {
          ...data,
          mutedWords: [...data.mutedWords, word],
        }
      })
      toast.show('Word muted')
      haptics.selection()
      router.back()
    } catch (e) {
      toast.show('Failed to mute word')
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                router.back()
              }}
            >
              <View hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text>Cancel</Text>
              </View>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleMuteWord}
              disabled={!word || word.length === 0}
            >
              <View hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text color={!word || word.length === 0 ? '$mauve8' : '$mauve12'}>
                  Save
                </Text>
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <View flex={1} backgroundColor="$color1" paddingBottom={height}>
        <Input
          placeholder="Enter word or phrase..."
          autoFocus
          value={word}
          onChangeText={setWord}
        />
        <View padding="$3">
          <Text color="$mauve11">You can mute one word or phrase at a time.</Text>
        </View>
      </View>
    </>
  )
}
