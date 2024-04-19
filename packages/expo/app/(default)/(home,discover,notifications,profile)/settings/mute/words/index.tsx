import { VolumeX } from '@tamagui/lucide-icons'
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler'
import { Text, View, XStack, YStack } from 'tamagui'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { Label } from '@/components/Label'
import { User } from '@/types'
import { useAuth } from '@/context/auth'
import { useQueryClient } from '@tanstack/react-query'
import { useToastController } from '@tamagui/toast'
import { unmuteWord } from '@/utils/api'
import { haptics } from '@/utils/haptics'
import { DebouncedLink } from '@/components/DebouncedLink'

export default function MuteWordsSettingsScreen() {
  const height = useBottomTabBarHeight()
  const { user, session } = useAuth()
  const queryClient = useQueryClient()
  const toast = useToastController()

  const handleUnmuteWord = async (word: string) => {
    try {
      await unmuteWord(word)
      queryClient.setQueryData<User>(['authUser', session?.fid], (data) => {
        if (!data) return
        return {
          ...data,
          mutedWords: data.mutedWords.filter((url) => url !== word),
        }
      })
      toast.show('Word unmuted')
      haptics.selection()
    } catch (e) {
      toast.show('Failed to unmute word')
    }
  }

  return (
    <View flex={1} backgroundColor="$color1" paddingBottom={height}>
      <View padding="$3">
        <Text color="$mauve11">
          Posts containing muted words won't show up across the app.
        </Text>
      </View>
      <YStack padding="$3" gap="$3">
        <XStack justifyContent="space-between" alignItems="flex-end">
          <Label>Muted Words</Label>
          <DebouncedLink href="/settings/mute/words/add-word">
            <XStack
              alignItems="center"
              gap="$1.5"
              backgroundColor="$mauve12"
              borderRadius="$10"
              paddingVertical="$2"
              paddingHorizontal="$3"
            >
              <Text fontWeight="600" color="$color1">
                Mute Word
              </Text>
            </XStack>
          </DebouncedLink>
        </XStack>
        <View marginBottom="$15">
          <FlatList
            data={user?.mutedWords}
            renderItem={({ item }) => (
              <MutedWord key={item} word={item} onUnmute={handleUnmuteWord} />
            )}
            ListEmptyComponent={<Text>No words muted yet.</Text>}
          />
        </View>
      </YStack>
    </View>
  )
}

const MutedWord = ({
  word,
  onUnmute,
}: { word: string; onUnmute: (word: string) => void }) => {
  return (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical="$2.5">
      <Text fontWeight="600" color="$mauve12">
        {word}
      </Text>
      <TouchableOpacity
        onPress={() => onUnmute(word)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View padding="$2">
          <VolumeX size={20} color="$red9" />
        </View>
      </TouchableOpacity>
    </XStack>
  )
}
