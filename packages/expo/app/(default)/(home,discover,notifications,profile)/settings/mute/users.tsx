import { ArrowLeft, VolumeX } from '@tamagui/lucide-icons'
import { Stack, router } from 'expo-router'
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler'
import { Text, View, XStack, YStack } from 'tamagui'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { SheetType, useSheets } from '@/context/sheet'
import { Label } from '@/components/Label'
import { FarcasterUser, User } from '@/types'
import { useAuth } from '@/context/auth'
import { useUser } from '@/hooks/useUser'
import { UserAvatar } from '@/components/UserAvatar'
import { useUserActions } from '@/hooks/useUserActions'
import { DebouncedLink } from '@/components/DebouncedLink'
import { Button } from '@/components/Button'

export default function MuteUserSettingsScreen() {
  const height = useBottomTabBarHeight()
  const { openSheet } = useSheets()
  const { user } = useAuth()
  const { muteUser, unmuteUser } = useUserActions()

  const handleMuteUser = async (user?: FarcasterUser) => {
    if (!user) return
    await muteUser(user)
  }

  const handleUnmuteUser = async (user?: FarcasterUser) => {
    if (!user) return
    await unmuteUser(user)
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
                <ArrowLeft size={24} color="$mauve12" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <View flex={1} backgroundColor="$color1" paddingBottom={height}>
        <View padding="$3">
          <Text color="$mauve11">
            Posts from muted accounts won't show up across the app unless viewing the
            user's profile. You can also mute users directly from their profile or posts.
          </Text>
        </View>
        <YStack padding="$3" gap="$3">
          <XStack justifyContent="space-between" alignItems="flex-end">
            <Label>Muted Users</Label>
            <Button
              variant="primary"
              onPress={() =>
                openSheet(SheetType.UserSelector, {
                  limit: 100,
                  users: [],
                  onSelectUser: handleMuteUser,
                  onUnselectUser: handleUnmuteUser,
                })
              }
            >
              Mute User
            </Button>
          </XStack>
          <View marginBottom="$15">
            <FlatList
              data={user?.mutedUsers}
              renderItem={({ item }) => (
                <MutedUser key={item} fid={item} onUnmute={handleUnmuteUser} />
              )}
              ListEmptyComponent={<Text>No users muted yet.</Text>}
            />
          </View>
        </YStack>
      </View>
    </>
  )
}

const MutedUser = ({
  fid,
  onUnmute,
}: { fid: string; onUnmute: (user: FarcasterUser) => void }) => {
  const { user } = useUser(fid)

  if (!user) return null

  return (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical="$2.5">
      <DebouncedLink
        href={{
          pathname: '/users/[fid]',
          params: { fid: user.fid },
        }}
      >
        <XStack gap="$2" alignItems="center">
          <UserAvatar pfp={user.pfp} size="$3" />
          <YStack gap="$1">
            <Text fontWeight="600" fontSize="$4" color="$mauve12">
              {user.displayName || user.username || `!${user.fid}`}
            </Text>
            <XStack gap="$1.5">
              <Text color="$mauve11">
                {user.username ? `@${user.username}` : `!${user.fid}`}
              </Text>
            </XStack>
          </YStack>
        </XStack>
      </DebouncedLink>
      <TouchableOpacity
        onPress={() => onUnmute(user)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View padding="$2">
          <VolumeX size={20} color="$red9" />
        </View>
      </TouchableOpacity>
    </XStack>
  )
}
