import { NookPanel, NookPanelType } from "@nook/common/types";
import { ContentFeedPanel } from "../panels/ContentFeedPanel";
import { useRef, useState } from "react";
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

export const SwipeablePanels = ({ panels }: { panels: NookPanel[] }) => {
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);
  const [tabLayouts, setTabLayouts] = useState<{ width: number; x: number }[]>(
    [],
  );

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

  const indicatorStyle = useAnimatedStyle(() => {
    if (tabLayouts.length <= 1) {
      // Handle single item case
      return {
        transform: [{ translateX: tabLayouts[0]?.x || 0 }], // Or any default starting position
        width: tabLayouts[0]?.width || SCREEN_WIDTH, // Or the width of the single tab if different
      };
    }
    // Assuming each panel has the same width as the screen
    const translateX = interpolate(
      scrollX.value,
      tabLayouts.map((_, index) => index * SCREEN_WIDTH),
      tabLayouts.map((tab) => tab.x), // Assuming `tab.x` is the starting position of each tab
    );

    // Assuming the width of the indicator should match the width of the tab
    // This could be a fixed value or dynamically calculated if tabs have different widths
    const width = interpolate(
      scrollX.value,
      tabLayouts.map((_, index) => index * SCREEN_WIDTH),
      tabLayouts.map((tab) => tab.width), // Assuming `tab.width` is the width of each tab
    );

    return {
      transform: [{ translateX: translateX }],
      width: width,
    };
  });

  const activeColor = theme.$color12.val;
  const inactiveColor = theme.$gray11.val;

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

      return { color, fontWeight: "700" };
    }),
  );

  return (
    <>
      <CreatePostButton />
      <YStack borderBottomWidth="$1" borderColor="$borderColor">
        <XStack
          paddingHorizontal="$5"
          paddingVertical="$1"
          gap="$2"
          alignItems="flex-end"
        >
          {panels.map((panel, i) => (
            <View
              key={panel.slug.toString()}
              onLayout={(event) => {
                const { width, x } = event.nativeEvent.layout;
                const newLayouts = [...tabLayouts];
                newLayouts[i] = { width, x };
                setTabLayouts(newLayouts);
              }}
              paddingHorizontal="$1"
            >
              <Animated.Text
                onPress={() => handlePress(i)}
                // fontWeight={currentIndex === i ? "700" : "500"}
                style={animatedTextStyles[i]}
              >
                {panel.name}
              </Animated.Text>
            </View>
          ))}
        </XStack>
        <Animated.View
          style={[{ height: 2, backgroundColor: "white" }, indicatorStyle]}
        />
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
        {panels.map((panel) => (
          <View
            key={panel.slug}
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

const Panel = ({ panel }: { panel: NookPanel }) => {
  switch (panel.type) {
    case NookPanelType.ContentFeed:
      return <ContentFeedPanel args={panel.args} />;
    default:
      return null;
  }
};
