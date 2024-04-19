import React, { useState } from 'react'
import { Modal } from 'react-native'
import { Octicons } from '@expo/vector-icons'
import { Text, useTheme as useTamaguiTheme, View } from 'tamagui'
import { haptics } from '@/utils/haptics'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  withSequence,
} from 'react-native-reanimated'
import { BlurView } from 'expo-blur'
import { X } from '@tamagui/lucide-icons'
import { useActions } from '@/context/actions'
import { FarcasterCast } from '@/types'
import { Label } from '../Label'
import { SheetType, useSheets } from '@/context/sheet'
import { useTheme } from '@/context/theme'
import { useCast } from '@/hooks/useCast'

const RADIUS = 70
const MAX_ACTIONS = 8

const calculatePosition = (index: number) => {
  const angle = ((2 * Math.PI) / MAX_ACTIONS) * index
  const x = RADIUS * Math.cos(angle)
  const y = RADIUS * Math.sin(angle)
  return { x, y }
}

export const FarcasterCastCustomAction = ({
  hash,
  noWidth,
}: { hash: string; noWidth?: boolean }) => {
  const { actions, executeAction, lastAction } = useActions()
  const theme = useTamaguiTheme()
  const { colorScheme } = useTheme()
  const [initialTouch, setInitialTouch] = useState<{ x: number; y: number } | null>(null)
  const opacity = useSharedValue(0)
  const isLongPressed = useSharedValue(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const { openSheet } = useSheets()
  const { cast } = useCast(hash)

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    }
  })

  const openModal = () => {
    opacity.value = withTiming(1, { duration: 300 })
    haptics.selection()
  }

  const closeModal = () => {
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(setInitialTouch)(null)
    })
    if (selectedIndex !== null) {
      const action = actions[selectedIndex]
      if (action && cast) {
        executeAction(action, cast)
        haptics.notificationSuccess()
      }
    }
    setSelectedIndex(null)
    setInitialTouch(null)
  }

  const longPress = Gesture.LongPress()
    .minDuration(100)
    .onStart((event) => {
      isLongPressed.value = true
      runOnJS(setInitialTouch)({
        x: event.absoluteX - event.x,
        y: event.absoluteY - event.y,
      })
      runOnJS(openModal)()
    })

  const panGesture = Gesture.Pan()
    .manualActivation(true)
    .onTouchesMove((event, stateManager) => {
      if (isLongPressed.value) {
        stateManager.activate()
      } else {
        stateManager.fail()
      }
    })
    .onUpdate((event) => {
      if (!initialTouch) return

      const distanceFromCenter = Math.sqrt(event.x ** 2 + event.y ** 2)
      const bufferRadius = 20 // Define the RADIUS of the buffer zone

      if (distanceFromCenter < bufferRadius) {
        runOnJS(setSelectedIndex)(null) // Inside buffer zone, set selected index to null
        return
      }

      // Calculate the angle of the gesture
      let angle = Math.atan2(event.y, event.x)
      if (angle < 0) angle += 2 * Math.PI // Normalize angle to be between 0 and 2*PI

      const segmentAngle = (2 * Math.PI) / MAX_ACTIONS
      // Offset the angle by half of the segment angle to center the selection
      angle = (angle + segmentAngle / 2) % (2 * Math.PI)

      // Determine the selected option based on the adjusted angle
      const selectedOptionIndex = Math.floor(angle / segmentAngle)

      runOnJS(setSelectedIndex)(selectedOptionIndex)
    })
    .onTouchesUp(() => {
      isLongPressed.value = false
      runOnJS(setInitialTouch)(null)
      runOnJS(closeModal)()
    })

  const composed = Gesture.Simultaneous(longPress, panGesture)

  const scaleAnim = useSharedValue(1)

  const animateScale = () => {
    scaleAnim.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withTiming(1, { duration: 100 })
    )
  }

  const handleInfo = () => {
    animateScale()
    openSheet(SheetType.Info, {
      title: 'New: Cast Actions',
      description:
        'Nook allows you to easily perform many actions on casts using the Action Wheel. Hold the action button to open the wheel. Drag and release to select an action to perform.\n\nNook will also remember your last performed action and use it as the default for taps. Get started by customizing your actions in the Profile tab.',
      route: {
        pathname: '/(default)/profile',
      },
      buttonText: 'Customize Actions',
    })
  }

  if (actions.filter(Boolean).length === 0) {
    return (
      <View
        minWidth={noWidth ? undefined : '$3.5'}
        onPress={handleInfo}
        onLongPress={handleInfo}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Octicons name="dot-fill" size={16} color={theme.mauve9.val} />
        </Animated.View>
      </View>
    )
  }

  return (
    <>
      <GestureDetector gesture={composed}>
        <View
          minWidth={noWidth ? undefined : '$3.5'}
          onPress={() => {
            if (lastAction && cast) {
              animateScale()
              executeAction(lastAction, cast)
              haptics.notificationSuccess()
            }
          }}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Octicons
              // @ts-ignore
              name={lastAction?.icon || 'dot-fill'}
              size={20}
              color={theme.mauve9.val}
            />
          </Animated.View>
        </View>
      </GestureDetector>
      <Modal
        visible={initialTouch !== null}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <Animated.View style={[{ flex: 1 }, overlayStyle]} onTouchEnd={closeModal}>
          <View
            backgroundColor="$color3"
            style={{
              position: 'absolute',
              left: (initialTouch?.x || 0) - 100 + 10,
              top: (initialTouch?.y || 0) - 100 + 10,
              borderRadius: 100,
              overflow: 'hidden',
              width: 200,
              height: 200,
              opacity: 0.5,
            }}
          />
          <BlurView
            intensity={50}
            tint={colorScheme || 'dark'}
            style={{
              position: 'absolute',
              left: (initialTouch?.x || 0) - 100 + 10,
              top: (initialTouch?.y || 0) - 100 + 10,
              borderRadius: 100,
              overflow: 'hidden',
              width: 200,
              height: 200,
              borderWidth: 1,
              borderColor: theme.color5.val,
            }}
          />
          {actions.map((action, index) => {
            const position = calculatePosition(index)
            return (
              <View
                key={index}
                position="absolute"
                left={(initialTouch?.x || 0) + position.x - 10}
                top={(initialTouch?.y || 0) + position.y - 10}
                backgroundColor={
                  selectedIndex === index && action !== null ? '$shadowColor' : undefined
                }
                width="$3"
                height="$3"
                borderRadius="$10"
                alignItems="center"
                justifyContent="center"
              >
                <Octicons
                  // @ts-ignore
                  name={action?.icon || 'dot-fill'}
                  size={action === null ? 16 : 20}
                  color={theme.color12.val}
                  opacity={
                    selectedIndex === index && action !== null
                      ? 1
                      : action === null
                        ? 0.25
                        : 0.75
                  }
                />
              </View>
            )
          })}
          <View
            position="absolute"
            left={(initialTouch?.x || 0) - 10}
            top={(initialTouch?.y || 0) - 10}
            width="$3"
            height="$3"
            borderRadius="$10"
            alignItems="center"
            justifyContent="center"
            backgroundColor={selectedIndex === null ? '$shadowColor' : undefined}
          >
            <X
              size={20}
              color={theme.color12.val}
              opacity={selectedIndex === null ? 1 : 0.5}
            />
          </View>
          <View
            position="absolute"
            top={(initialTouch?.y || 0) - 120}
            width="100%"
            alignItems="center"
          >
            {selectedIndex !== null && actions[selectedIndex] !== null && (
              <View
                backgroundColor="$color6"
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$6"
              >
                <Text color="$mauve12" fontWeight="600">
                  {actions[selectedIndex]?.name || ''}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </Modal>
    </>
  )
}
