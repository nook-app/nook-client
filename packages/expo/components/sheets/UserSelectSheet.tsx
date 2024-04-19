import { View, XStack, YStack, useDebounceValue } from 'tamagui'
import { BaseSheet } from './BaseSheet'
import { Text } from 'tamagui'
import { SheetType, useSheet } from '@/context/sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useEffect, useState } from 'react'
import { searchUsers } from '@/utils/api/user'
import { FarcasterUserPanel } from '../farcaster/FarcasterUserPanel'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Keyboard, KeyboardAvoidingView } from 'react-native'
import { FarcasterUser } from '@/types'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { Image } from 'expo-image'
import { SearchInput } from '../SearchInput'

const queryClient = new QueryClient()

export const UserSelectorSheet = () => {
  const { sheet, closeSheet } = useSheet(SheetType.UserSelector)
  const [users, setUsers] = useState<FarcasterUser[]>(sheet.initialState?.users || [])
  const [query, setQuery] = useState('')
  const insets = useSafeAreaInsets()

  useEffect(() => {
    sheet.initialState?.onChange?.(users)
  }, [users])

  useEffect(() => {
    setUsers(sheet.initialState?.users || [])
  }, [sheet.initialState?.users])

  const debouncedQuery = useDebounceValue(query, 500)

  return (
    <BaseSheet sheet={sheet}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <YStack
          style={{
            paddingBottom: insets.bottom,
          }}
          gap="$2"
          padding="$4"
          flex={1}
        >
          <XStack alignItems="center" justifyContent="space-between">
            <Text>
              <Text fontWeight="700" fontSize="$8" color="$mauve12">
                {`Select User${sheet.initialState?.limit ? 's' : ''}`}
              </Text>
              {sheet.initialState?.limit && (
                <Text fontWeight="500" fontSize="$6" color="$mauve12">
                  {` (${users.length}/${sheet.initialState?.limit})`}
                </Text>
              )}
            </Text>
            <View
              padding="$2"
              onPress={() => {
                if (!sheet.initialState?.limit) {
                  sheet.initialState?.onSelectUser?.()
                }
                closeSheet(SheetType.UserSelector)
              }}
            >
              <Text color="$mauve12">
                {sheet.initialState?.limit ? 'Save' : 'Remove'}
              </Text>
            </View>
          </XStack>
          <SearchInput query={query} setQuery={setQuery} />
          {sheet.initialState?.limit && (
            <XStack gap="$2" flexWrap="wrap">
              {users.map((user) => (
                <TouchableOpacity
                  key={user.fid}
                  onPress={() => {
                    setUsers((prev) => prev.filter((c) => c.fid !== user.fid))
                    sheet.initialState?.onUnselectUser?.(user)
                  }}
                >
                  <XStack
                    key={user.fid}
                    paddingVertical="$2"
                    paddingHorizontal="$3"
                    backgroundColor="$color5"
                    borderRadius="$6"
                    gap="$2"
                  >
                    <View borderRadius="$10" overflow="hidden">
                      {user.pfp && (
                        <Image
                          source={{ uri: user.pfp }}
                          style={{ width: 16, height: 16 }}
                        />
                      )}
                    </View>
                    <Text>{user.username || `!${user.fid}`}</Text>
                  </XStack>
                </TouchableOpacity>
              ))}
            </XStack>
          )}
          <QueryClientProvider client={queryClient}>
            <View style={{ minHeight: 2 }} flexGrow={1}>
              <FarcasterUserPanel
                keys={['searchUsers', debouncedQuery]}
                fetch={({ pageParam }) => searchUsers(debouncedQuery, pageParam)}
                onPress={(user) => {
                  Keyboard.dismiss()
                  const selected = users.find((c) => c.fid === user.fid)
                  if (selected) {
                    setUsers((prev) => prev.filter((c) => c.fid !== user.fid))
                    sheet.initialState?.onUnselectUser?.(user)
                  } else if (
                    !sheet.initialState?.limit ||
                    sheet.initialState.limit === 1
                  ) {
                    setUsers([user])
                    sheet.initialState?.onSelectUser?.(user)
                  } else if (users.length < sheet.initialState?.limit) {
                    setUsers((prev) => [...prev, user])
                    sheet.initialState?.onSelectUser?.(user)
                  }

                  setQuery('')

                  if (!sheet.initialState?.limit) {
                    closeSheet(SheetType.UserSelector)
                  }
                }}
                highlighted={users.map((c) => c.fid)}
                displayMode="selector"
                asBottomSheet
              />
            </View>
          </QueryClientProvider>
        </YStack>
      </KeyboardAvoidingView>
    </BaseSheet>
  )
}
