import { Search } from '@tamagui/lucide-icons'
import { memo, useEffect, useRef, useState } from 'react'
import { Keyboard, TextInput as RNInput } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useTheme, useWindowDimensions } from 'tamagui'
import { Input, Text, View, XStack } from 'tamagui'

export const SearchInput = memo(
  ({
    query,
    setQuery,
    onSubmitEditing,
    autoFocus,
  }: {
    query: string
    setQuery: (query: string) => void
    onSubmitEditing?: (query: string) => void
    autoFocus?: boolean
  }) => {
    const { width } = useWindowDimensions()
    const theme = useTheme()

    const [isFocused, setIsFocused] = useState(false)

    const fadeAnim = useSharedValue(0)
    const fadeAnimReverse = useSharedValue(1)

    const inputRef = useRef<RNInput>(null)

    const handleFocus = () => {
      setIsFocused(true)
      if (inputRef.current) {
        inputRef.current.focus()
        setTimeout(() => {
          inputRef.current?.setNativeProps({
            selection: { start: 0, end: query.length },
          })
        }, 0)
      }
    }

    useEffect(() => {
      fadeAnim.value = withTiming(isFocused ? 1 : 0, { duration: 300 })
      fadeAnimReverse.value = withTiming(isFocused ? 0 : 1, { duration: 300 })
    }, [isFocused])

    const fadeAnimStyle = useAnimatedStyle(() => {
      return {
        opacity: fadeAnim.value,
      }
    })

    const inputPadding = useSharedValue(0)

    useEffect(() => {
      // Adjust these values based on your design for the initial and final padding
      inputPadding.value = withTiming(isFocused ? 0 : width / 4, { duration: 300 })
    }, [isFocused])

    const animatedInputStyle = useAnimatedStyle(() => {
      return {
        paddingHorizontal: inputPadding.value,
      }
    })

    return (
      <XStack width="100%" alignItems="center">
        <View
          backgroundColor="$color3"
          borderRadius="$10"
          flexGrow={1}
          height="$4"
          paddingHorizontal="$3"
          onPress={() => inputRef?.current?.focus()}
          alignItems={isFocused ? 'flex-start' : 'center'}
        >
          <Animated.View
            style={[
              { flex: 1, flexDirection: 'row', alignItems: 'center' },
              animatedInputStyle,
            ]}
          >
            <Search size={16} color={theme.color11.val} strokeWidth={3} />
            <Input
              ref={inputRef}
              placeholder="Search"
              returnKeyType="search"
              value={query}
              onChangeText={setQuery}
              enablesReturnKeyAutomatically
              borderWidth="$0"
              backgroundColor="$color3"
              placeholderTextColor="$color11"
              borderRadius="$10"
              onSubmitEditing={(e) => onSubmitEditing?.(e.nativeEvent.text)}
              paddingHorizontal="$2"
              minWidth="$6"
              onFocus={handleFocus}
              onBlur={() => setIsFocused(false)}
              textAlign={isFocused ? 'left' : 'center'}
              autoFocus={autoFocus}
            />
          </Animated.View>
        </View>
        {isFocused ? (
          <Animated.View style={fadeAnimStyle}>
            <View
              padding="$2"
              onPress={() => {
                Keyboard.dismiss()
                setQuery('')
              }}
            >
              <Text>Cancel</Text>
            </View>
          </Animated.View>
        ) : (
          <></>
        )}
      </XStack>
    )
  }
)
