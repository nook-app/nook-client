import { Search } from "@tamagui/lucide-icons";
import {
  ReactNode,
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Keyboard, TextInput as RNInput } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTheme, useWindowDimensions } from "tamagui";
import { Input, Text, View, XStack } from "tamagui";

export const SearchBar = memo(
  ({
    query,
    setQuery,
    onSubmitEditing,
    autoFocus,
    prefix,
    right,
  }: {
    query: string;
    setQuery: (query: string) => void;
    onSubmitEditing?: (query: string) => void;
    autoFocus?: boolean;
    prefix?: ReactNode;
    right?: ReactNode;
  }) => {
    const { width } = useWindowDimensions();
    const theme = useTheme();

    const [isFocused, setIsFocused] = useState(false);

    useLayoutEffect(() => {
      if (autoFocus) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 200);
      }
    }, [autoFocus]);

    const fadeAnim = useSharedValue(0);
    const fadeAnimReverse = useSharedValue(1);

    const inputRef = useRef<RNInput>(null);

    const handleFocus = () => {
      setIsFocused(true);
      if (inputRef.current) {
        inputRef.current.focus();
        setTimeout(() => {
          inputRef.current?.setNativeProps({
            selection: { start: 0, end: query.length },
          });
        }, 0);
      }
    };

    useEffect(() => {
      fadeAnim.value = withTiming(isFocused ? 1 : 0, { duration: 300 });
      fadeAnimReverse.value = withTiming(isFocused ? 0 : 1, { duration: 300 });
    }, [isFocused, fadeAnim, fadeAnimReverse]);

    const fadeAnimStyle = useAnimatedStyle(() => {
      return {
        opacity: fadeAnim.value,
      };
    });

    const inputPadding = useSharedValue(0);

    useEffect(() => {
      // Adjust these values based on your design for the initial and final padding
      inputPadding.value = withTiming(isFocused ? 0 : width / 4, {
        duration: 300,
      });
    }, [isFocused, inputPadding, width]);

    const animatedInputStyle = useAnimatedStyle(() => {
      return {
        paddingHorizontal: inputPadding.value,
      };
    });

    return (
      <>
        <View
          backgroundColor="$color4"
          borderRadius="$10"
          flexShrink={1}
          flexGrow={1}
          paddingHorizontal="$3"
          height="$3.5"
          onPress={() => inputRef?.current?.focus()}
          alignItems={isFocused ? "flex-start" : "center"}
        >
          <Animated.View
            style={[
              {
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
              },
              animatedInputStyle,
            ]}
          >
            <Search size={16} color={theme.color11.val} strokeWidth={3} />
            {prefix && <View paddingLeft="$2">{prefix}</View>}
            <Input
              ref={inputRef}
              height="$3.5"
              placeholder="Search"
              returnKeyType="search"
              value={query}
              onChangeText={setQuery}
              enablesReturnKeyAutomatically
              borderWidth="$0"
              backgroundColor="$color4"
              placeholderTextColor="$color11"
              borderRadius="$10"
              onSubmitEditing={(e) => onSubmitEditing?.(e.nativeEvent.text)}
              paddingHorizontal="$2"
              onFocus={handleFocus}
              onBlur={() => setIsFocused(false)}
              textAlign={isFocused ? "left" : "center"}
            />
          </Animated.View>
        </View>
        {isFocused ? (
          <Animated.View style={fadeAnimStyle}>
            <View
              onPress={() => {
                Keyboard.dismiss();
                setQuery("");
              }}
            >
              <Text>Cancel</Text>
            </View>
          </Animated.View>
        ) : (
          <></>
        )}
      </>
    );
  },
);
