import { View, XStack, YStack, useDebounceValue } from 'tamagui'
import { BaseSheet } from './BaseSheet'
import { Text } from 'tamagui'
import { SheetType, useSheet } from '@/context/sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useEffect, useState } from 'react'
import { fetchRecommendedChannels, searchChannels } from '@/utils/api/channel'
import { FarcasterChannelPanel } from '../farcaster/FarcasterChannelPanel'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Keyboard, KeyboardAvoidingView } from 'react-native'
import { Channel } from '@/types'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { Image } from 'expo-image'
import { SearchInput } from '../SearchInput'

const queryClient = new QueryClient()

export const ChannelSelectorSheet = () => {
  const { sheet, closeSheet } = useSheet(SheetType.ChannelSelector)
  const [channels, setChannels] = useState<Channel[]>(sheet.initialState?.channels || [])
  const [query, setQuery] = useState('')
  const insets = useSafeAreaInsets()

  useEffect(() => {
    sheet.initialState?.onChange?.(channels)
  }, [channels])

  useEffect(() => {
    if (sheet.isOpen) {
      setChannels(sheet.initialState?.channels || [])
      setQuery('')
    }
  }, [sheet.isOpen])

  const debouncedQuery = useDebounceValue(query, 500)

  return (
    <BaseSheet sheet={sheet}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <YStack
          style={{
            paddingBottom: insets.bottom,
          }}
          gap="$2"
          paddingHorizontal="$3"
          flex={1}
        >
          <XStack alignItems="center" justifyContent="space-between">
            <Text>
              <Text fontWeight="600" fontSize="$8" color="$mauve12">
                {`Select Channel${sheet.initialState?.limit ? 's' : ''}`}
              </Text>
              {sheet.initialState?.limit && (
                <Text fontWeight="500" fontSize="$6" color="$mauve12">
                  {` (${channels.length}/${sheet.initialState?.limit})`}
                </Text>
              )}
            </Text>
            <View
              padding="$2"
              onPress={() => {
                if (!sheet.initialState?.limit) {
                  sheet.initialState?.onSelectChannel?.()
                }
                closeSheet(SheetType.ChannelSelector)
              }}
            >
              <Text color="$mauve12">
                {sheet.initialState?.limit ? 'Close' : 'Remove'}
              </Text>
            </View>
          </XStack>
          <SearchInput query={query} setQuery={setQuery} />
          {sheet.initialState?.limit && (
            <XStack gap="$2" flexWrap="wrap">
              {channels.map((channel) => (
                <TouchableOpacity
                  key={channel.channelId}
                  onPress={() => {
                    setChannels((prev) =>
                      prev.filter((c) => c.channelId !== channel.channelId)
                    )
                    sheet.initialState?.onUnselectChannel?.(channel)
                  }}
                >
                  <XStack
                    key={channel.channelId}
                    paddingVertical="$2"
                    paddingHorizontal="$3"
                    backgroundColor="$color5"
                    borderRadius="$6"
                    gap="$2"
                  >
                    <View borderRadius="$10" overflow="hidden">
                      {channel.imageUrl && (
                        <Image
                          source={{ uri: channel.imageUrl }}
                          style={{ width: 16, height: 16 }}
                        />
                      )}
                    </View>
                    <Text color="$mauve12">{channel.name}</Text>
                  </XStack>
                </TouchableOpacity>
              ))}
            </XStack>
          )}
          <QueryClientProvider client={queryClient}>
            <View style={{ minHeight: 2 }} flexGrow={1}>
              <FarcasterChannelPanel
                keys={['searchChannels', debouncedQuery]}
                fetch={({ pageParam }) => {
                  if (!debouncedQuery && sheet.initialState?.showRecommended) {
                    return fetchRecommendedChannels()
                  }
                  return searchChannels(debouncedQuery, pageParam)
                }}
                onPress={(channel) => {
                  Keyboard.dismiss()
                  const selected = channels.find((c) => c.channelId === channel.channelId)
                  if (selected) {
                    setChannels((prev) =>
                      prev.filter((c) => c.channelId !== channel.channelId)
                    )
                    sheet.initialState?.onUnselectChannel?.(channel)
                  } else if (
                    !sheet.initialState?.limit ||
                    sheet.initialState.limit === 1
                  ) {
                    setChannels([channel])
                    sheet.initialState?.onSelectChannel?.(channel)
                  } else if (channels.length < sheet.initialState?.limit) {
                    setChannels((prev) => [...prev, channel])
                    sheet.initialState?.onSelectChannel?.(channel)
                  }

                  if (!sheet.initialState?.limit || sheet.initialState.limit === 1) {
                    closeSheet(SheetType.ChannelSelector)
                  }
                }}
                highlighted={channels.map((c) => c.channelId)}
                asBottomSheet
              />
            </View>
          </QueryClientProvider>
        </YStack>
      </KeyboardAvoidingView>
    </BaseSheet>
  )
}
