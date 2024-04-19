import { Stack, router, useLocalSearchParams } from 'expo-router'
import { KeyboardAvoidingView } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { Spinner, Text, View, XStack, YStack } from 'tamagui'
import { useHeaderHeight } from '@react-navigation/elements'
import { useAuth } from '@/context/auth'
import { useEffect } from 'react'
import { Channel, Nook, Panel } from '@/types'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useCreateNook } from '@/hooks/useCreateNook'
import { Input } from '@/components/Input'
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  ScaleDecorator,
} from 'react-native-draggable-flatlist'
import { haptics } from '@/utils/haptics'
import { AlignJustify, Minus, Plus } from '@tamagui/lucide-icons'
import { Label } from '@/components/Label'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export default function UpdateNookScreen() {
  const { nookId } = useLocalSearchParams()
  const { nooks } = useAuth()

  const nook = nooks.find((nook) => nook.id === nookId)

  if (!nook) {
    return (
      <>
        <Stack.Screen
          options={{
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  router.back()
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View>
                  <Text>Cancel</Text>
                </View>
              </TouchableOpacity>
            ),
          }}
        />
        <LoadingScreen />
      </>
    )
  }

  return <UpdateNook nook={nook} />
}

const UpdateNook = ({ nook }: { nook: Nook }) => {
  const headerHeight = useHeaderHeight()
  const { name, setName, panels, setPanels, update, isLoading } = useCreateNook()

  useEffect(() => {
    setName(nook.name)
    setPanels(nook.panels)
  }, [nook])

  const disabled = name.length === 0 || name.length > 50

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                router.back()
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View>
                <Text>Cancel</Text>
              </View>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => update(nook.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={isLoading || disabled}
            >
              <View>
                {isLoading ? (
                  <Spinner />
                ) : (
                  <Text color={disabled ? '$mauve9' : '$mauve12'}>Save</Text>
                )}
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <View flex={1} backgroundColor="$color1">
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <NestableScrollContainer
            contentContainerStyle={{ paddingBottom: headerHeight }}
          >
            <YStack padding="$3" gap="$3">
              <Text fontWeight="600" fontSize="$7">
                {`Update ${nook.name}`}
              </Text>
              <Text>
                A nook is a collection of tabs that you can use to organize your feeds and
                swipe between. You can change the order of your tabs at any time.
              </Text>
              <YStack gap="$1.5">
                <Input
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter name..."
                  label="Nook Name"
                />
                <Text color="$red9" fontSize="$2">
                  {name.length > 50 ? `Must be less than 50 characters` : ''}
                </Text>
              </YStack>
            </YStack>
            <PanelOrderer panels={panels} setPanels={setPanels} />
          </NestableScrollContainer>
        </KeyboardAvoidingView>
      </View>
    </>
  )
}

const PanelOrderer = ({
  panels,
  setPanels,
}: { panels: Panel[]; setPanels: (panels: Panel[]) => void }) => {
  const addPanel = (panel: Panel) => {
    setPanels([...panels, panel])
  }

  const removePanel = (panel: Panel) => {
    setPanels(panels.filter((p) => p.id !== panel.id))
  }

  const feedPanels = panels.filter((panel) => panel.type === 'feed')
  const channelPanels = panels.filter((panel) => panel.type === 'channel')

  return (
    <YStack gap="$2">
      <View paddingHorizontal="$3">
        <Label>Tab Order</Label>
      </View>
      <NestableDraggableFlatList
        data={panels || []}
        keyExtractor={(item) => `${item.type}-${item.key}`}
        onDragEnd={({ data }) => {
          setPanels(data)
        }}
        onPlaceholderIndexChange={haptics.selection}
        renderItem={({ item, drag }) => (
          <ScaleDecorator>
            <TouchableOpacity onLongPress={drag}>
              <XStack
                justifyContent="space-between"
                alignItems="center"
                paddingVertical="$3"
                paddingHorizontal="$3"
              >
                <XStack gap="$3" alignItems="center" flex={1}>
                  <TouchableOpacity onPress={() => removePanel(item)}>
                    <View
                      backgroundColor="$red9"
                      borderRadius="$10"
                      width="$1.5"
                      height="$1.5"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Minus size={16} color="$color1" strokeWidth={3} />
                    </View>
                  </TouchableOpacity>
                  <Text fontSize="$6" numberOfLines={1} flexShrink={1}>
                    {item.name}
                  </Text>
                </XStack>
                <AlignJustify size={24} color="$mauve12" opacity={0.5} />
              </XStack>
            </TouchableOpacity>
          </ScaleDecorator>
        )}
      />
      <FeedPanels feedPanels={feedPanels} addPanel={addPanel} />
      <FollowedChannelPanels followedChannelPanels={channelPanels} addPanel={addPanel} />
    </YStack>
  )
}

const FollowedChannelPanels = ({
  followedChannelPanels,
  addPanel,
}: { followedChannelPanels: Panel[]; addPanel: (panel: Panel) => void }) => {
  const { session } = useAuth()
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['followedChannels', session?.fid],
    queryFn: async () => {
      let cursor: string | undefined = undefined
      const followedChannels: Channel[] = []
      do {
        const response: Response = await fetch(
          `https://api.warpcast.com/v1/user-following-channels?fid=${session?.fid}${
            cursor ? `&cursor=${cursor}` : ''
          }`
        )
        const data = await response.json()
        followedChannels.push(
          ...data.result.channels.map((d: any) => ({
            ...d,
            creatorId: d.leadFid,
            channelId: d.id,
          }))
        )
        cursor = data.next?.cursor
      } while (cursor)

      for (const channel of followedChannels) {
        queryClient.setQueryData(['channel', channel.channelId], channel)
      }

      return followedChannels.sort((a, b) => {
        return a.name.localeCompare(b.name)
      })
    },
  })

  return (
    <AddPanelGroup
      label="Followed Channels"
      panels={
        data
          ?.filter(
            (channel) =>
              !followedChannelPanels.some((panel) => panel.key === channel.channelId)
          )
          .map((channel) => ({ id: channel.channelId, name: channel.name })) || []
      }
      onAdd={(id) => {
        const channel = data?.find((channel) => channel.channelId === id)
        if (!channel) return
        addPanel({
          id: '',
          type: 'channel',
          key: channel.channelId,
          name: channel.name,
        })
      }}
    />
  )
}

const FeedPanels = ({
  feedPanels,
  addPanel,
}: { feedPanels: Panel[]; addPanel: (panel: Panel) => void }) => {
  const { feeds } = useAuth()

  return (
    <AddPanelGroup
      label="Feeds"
      panels={feeds
        .filter((feed) => !feedPanels.some((panel) => panel.key === feed.id))
        .map(({ id, name }) => ({ id, name }))}
      onAdd={(id) => {
        const feed = feeds.find((feed) => feed.id === id)
        if (!feed) return
        addPanel({
          id: '',
          type: 'feed',
          key: feed.id,
          name: feed.name,
          display: feed.display,
        })
      }}
    />
  )
}

const AddPanelGroup = ({
  label,
  panels,
  onAdd,
}: {
  label: string
  panels: { id: string; name: string }[]
  onAdd: (id: string) => void
}) => {
  return (
    <YStack gap="$2">
      <View paddingHorizontal="$3">
        <Label>{label}</Label>
      </View>
      {panels?.map((panel) => (
        <TouchableOpacity key={panel.id} onPress={() => onAdd(panel.id)}>
          <XStack
            justifyContent="space-between"
            alignItems="center"
            paddingVertical="$3"
            paddingHorizontal="$3"
          >
            <XStack gap="$3" alignItems="center">
              <View
                backgroundColor="$green9"
                borderRadius="$10"
                width="$1.5"
                height="$1.5"
                justifyContent="center"
                alignItems="center"
              >
                <Plus size={16} color="$color1" strokeWidth={3} />
              </View>
              <Text fontSize="$6" numberOfLines={1} flexShrink={1}>
                {panel.name}
              </Text>
            </XStack>
          </XStack>
        </TouchableOpacity>
      ))}
    </YStack>
  )
}
