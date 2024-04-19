import { useActions } from '@/context/actions'
import { CastActionRequest } from '@/types'
import { stringToColor } from '@/utils'
import { haptics } from '@/utils/haptics'
import { Octicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Linking } from 'react-native'
import { TapGestureHandler, TouchableOpacity } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, Spinner, Text, View, XStack, useTheme } from 'tamagui'
import { YStack } from 'tamagui'

const RADIUS = 100
const MAX_ACTIONS = 8

const calculatePosition = (index: number) => {
  const angle = ((2 * Math.PI) / MAX_ACTIONS) * index
  const x = RADIUS * Math.cos(angle)
  const y = RADIUS * Math.sin(angle)
  return { x, y }
}

export default function AddCastAction() {
  const { updateAction } = useActions()
  const params = useLocalSearchParams()
  const insets = useSafeAreaInsets()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionParams, setActionParams] = useState<CastActionRequest | undefined>()

  useEffect(() => {
    if (params.url) {
      fetch(params.url as string).then(async (res) => {
        const json = await res.json()
        setActionParams({
          ...json,
          postUrl: params.url as string,
          actionType: json?.action?.type,
        })
      })
    } else {
      setActionParams({
        name: params.name as string,
        icon: params.icon as string,
        description: params.description as string,
        aboutUrl: params.aboutUrl as string,
        actionType: params.actionType as string,
        postUrl: params.postUrl as string,
      })
    }
  }, [params])

  const handleSave = async () => {
    if (selectedIndex === null || !actionParams) return
    setLoading(true)
    await updateAction(selectedIndex, actionParams, !!params.url)
    setLoading(false)
    router.back()
  }

  if (!actionParams)
    return (
      <View
        flex={1}
        backgroundColor="$color1"
        alignItems="center"
        justifyContent="center"
        style={{
          paddingBottom: insets.bottom,
        }}
        paddingHorizontal="$3"
      >
        <Spinner />
      </View>
    )

  return (
    <View
      flex={1}
      backgroundColor="$color1"
      justifyContent="space-between"
      style={{
        paddingBottom: insets.bottom,
      }}
      paddingHorizontal="$3"
    >
      <YStack paddingTop="$3" gap="$4" paddingHorizontal="$3">
        <XStack alignItems="center" gap="$2">
          <View
            width="$4"
            height="$4"
            alignItems="center"
            justifyContent="center"
            borderRadius="$4"
            backgroundColor={stringToColor(actionParams.name)}
          >
            {/* @ts-ignore */}
            <Octicons name={actionParams.icon} size={24} color="white" />
          </View>
          <YStack>
            <Text fontWeight="600" fontSize="$6">
              {actionParams.name}
            </Text>
            <Text color="$mauve11" numberOfLines={1}>
              {actionParams.postUrl}
            </Text>
          </YStack>
        </XStack>
        <YStack gap="$2">
          <Text>{actionParams.description}</Text>
          {actionParams.aboutUrl && (
            <TouchableOpacity
              onPress={() => Linking.openURL(actionParams.aboutUrl as string)}
            >
              <Text color="$color11" fontSize="$2" fontWeight="600">
                Learn more
              </Text>
            </TouchableOpacity>
          )}
        </YStack>
        <XStack alignItems="center" justifyContent="center" paddingVertical="$4">
          <ActionDisplay
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            icon={actionParams.icon}
          />
        </XStack>
      </YStack>
      <Button
        onPress={handleSave}
        disabled={selectedIndex === null}
        disabledStyle={{
          backgroundColor: '$color3',
        }}
      >
        <Text fontWeight="500" color={selectedIndex === null ? '$mauve10' : '$mauve12'}>
          {loading ? <Spinner /> : 'Save'}
        </Text>
      </Button>
    </View>
  )
}

const ActionDisplay = ({
  selectedIndex,
  setSelectedIndex,
  icon,
}: {
  selectedIndex: number | null
  setSelectedIndex: (index: number) => void
  icon: string
}) => {
  const { actions } = useActions()
  const theme = useTheme()

  return (
    <View
      backgroundColor="$color3"
      style={{
        borderRadius: 150,
        overflow: 'hidden',
        width: 300,
        height: 300,
      }}
    >
      {actions.map((action, index) => {
        const position = calculatePosition(index)
        return (
          <TapGestureHandler key={index}>
            <View
              key={index}
              position="absolute"
              left={position.x + 150 - 32}
              top={position.y + 150 - 32}
              width="$6"
              height="$6"
              borderRadius="$10"
              alignItems="center"
              justifyContent="center"
              onPress={() => {
                setSelectedIndex(index)
                haptics.selection()
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {index === selectedIndex ? (
                <Octicons
                  // @ts-ignore
                  name={icon}
                  size={32}
                  color={theme.color12.val}
                />
              ) : action?.icon ? (
                <Octicons
                  // @ts-ignore
                  name={action.icon}
                  size={32}
                  color={theme.color12.val}
                />
              ) : (
                <Octicons
                  // @ts-ignore
                  name="dot-fill"
                  size={24}
                  color={theme.color12.val}
                  opacity={0.5}
                />
              )}
            </View>
          </TapGestureHandler>
        )
      })}
    </View>
  )
}
