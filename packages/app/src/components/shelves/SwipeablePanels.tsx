import { Nook, NookPanel, NookPanelType, NookShelf } from "@nook/common/types";
import { ContentFeedPanel } from "../panels/ContentFeedPanel";
import { memo, useRef } from "react";
import { Dimensions } from "react-native";
import { View, XStack, YStack, useTheme } from "tamagui";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
} from "react-native-reanimated";
import { CreatePostButton } from "../actions/CreatePostButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const SwipeablePanels = ({
  nook,
  shelf,
}: { nook: Nook; shelf: NookShelf }) => {
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);
  const theme = useTheme();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handlePress = (index: number) => {
    const x = index * SCREEN_WIDTH;
    scrollViewRef.current?.scrollTo({ x, animated: true });
  };

  const activeColor = theme.$color12.val;
  const inactiveColor = theme.$gray10.val;

  const activeFontSize = 16;
  const inactiveFontSize = 14;

  // TODO: Figure out how to make this dynamic based on number of panels
  const animatedTextStyles = new Array(5).fill(0).map((_, index) =>
    useAnimatedStyle(() => {
      const inputRange = [
        (index - 1) * SCREEN_WIDTH, // Previous tab
        index * SCREEN_WIDTH, // Current tab
        (index + 1) * SCREEN_WIDTH, // Next tab
      ];

      const color = interpolateColor(
        scrollX.value,
        inputRange,
        [inactiveColor, activeColor, inactiveColor], // Colors for transitioning: from inactive to active to inactive
      );

      // Interpolate the font size based on the scroll position
      const fontSize = interpolate(
        scrollX.value,
        inputRange,
        [inactiveFontSize, activeFontSize, inactiveFontSize], // Transition from inactive to active to inactive font size
      );
      // Interpolate a numeric value for fontWeight
      const fontWeightNumeric = interpolate(
        scrollX.value,
        inputRange,
        [400, 700, 400], // Example: 400 for "normal", 700 for "bold"
      );

      // Map the numeric fontWeight to string values
      const fontWeight = fontWeightNumeric > 550 ? "bold" : "bold";

      return { color, fontWeight, fontSize };
    }),
  );

  return (
    <>
      <CreatePostButton />
      <YStack
        borderBottomWidth="$0.25"
        borderColor="$borderColor"
        backgroundColor="$background"
      >
        <XStack
          paddingHorizontal="$5"
          paddingVertical="$1"
          gap="$2"
          alignItems="flex-end"
          justifyContent="center"
        >
          {shelf.panels.map((panel, i) => (
            <View key={`${nook.nookId}-${shelf.slug}-${panel.slug}`}>
              <Animated.Text
                onPress={() => handlePress(i)}
                style={animatedTextStyles[i]}
              >
                {panel.name}
              </Animated.Text>
            </View>
          ))}
        </XStack>
      </YStack>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        alwaysBounceHorizontal={false}
        bounces={false}
      >
        {shelf.panels.map((panel) => (
          <View
            key={`${nook.nookId}-${shelf.slug}-${panel.slug}`}
            style={{
              width: SCREEN_WIDTH,
              alignItems: "center",
            }}
          >
            <View width="100%">
              <Panel panel={panel} />
            </View>
          </View>
        ))}
      </Animated.ScrollView>
    </>
  );
};

const Panel = memo(({ panel }: { panel: NookPanel }) => {
  switch (panel.type) {
    case NookPanelType.ContentFeed:
      return <ContentFeedPanel args={panel.args} />;
    default:
      return null;
  }
});
