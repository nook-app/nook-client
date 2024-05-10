import {
  NookText,
  Spinner,
  View,
  XStack,
  YStack,
  useTheme as useTamaguiTheme,
} from "@nook/app-ui";
import { IconButton } from "./IconButton";
import { Search } from "@tamagui/lucide-icons";
import { DrawerToggleButton } from "./DrawerToggleButton";
import { useTheme } from "@nook/app/context/theme";
import { BlurView } from "expo-blur";
import { useScroll } from "@nook/app/context/scroll";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PagerView from "react-native-pager-view";

export const HEADER_HEIGHT = 94 + 40;

export const PagerLayout = ({
  title,
  pages,
}: { title: string; pages: { name: string; component: ReactNode }[] }) => {
  const theme = useTamaguiTheme();
  const { rootTheme } = useTheme();
  const { isScrolling, setIsScrolling } = useScroll();
  const insets = useSafeAreaInsets();

  // @ts-ignore
  const ref = useRef<PagerView>(null);
  const [page, setPage] = useState(0);

  const tabWidths = useRef(new Array(pages.length).fill(0));
  const indicatorWidth = useSharedValue(0);
  const indicatorPosition = useSharedValue(0);
  const textWidths = useRef(new Array(pages.length).fill(0));
  const textWidth = useSharedValue(0);
  const textColor = useSharedValue(theme.mauve11.val);

  const headerHeight = useSharedValue(isScrolling ? 0 : HEADER_HEIGHT);
  const headerPaddingTop = useSharedValue(isScrolling ? 0 : insets.top);
  const headerOpacity = useSharedValue(isScrolling ? 0 : 1);

  useEffect(() => {
    headerHeight.value = withTiming(isScrolling ? 0 : HEADER_HEIGHT, {
      duration: 100,
    });
    headerPaddingTop.value = withTiming(isScrolling ? 0 : insets.top, {
      duration: 100,
    });
    headerOpacity.value = withTiming(isScrolling ? 0 : 1, { duration: 100 });
  }, [isScrolling, headerHeight, headerPaddingTop, insets.top, headerOpacity]);

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value,
      paddingTop: headerPaddingTop.value,
      opacity: headerOpacity.value,
      justifyContent: "flex-end",
      position: "absolute",
      zIndex: 1,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "transparent",
    };
  });

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      bottom: 0,
      left: indicatorPosition.value,
      width: indicatorWidth.value,
    };
  });

  const animatedTextIndicatorStyle = useAnimatedStyle(() => {
    return {
      width: textWidth.value,
      height: 3,
      backgroundColor: theme.color11.val,
      left: (indicatorWidth.value - textWidth.value) / 2,
      borderRadius: 9,
    };
  });

  const textColorValues = useRef(
    pages.map(() => useSharedValue(theme.mauve11.val)),
  );

  useEffect(() => {
    for (const [index, color] of textColorValues.current.entries()) {
      color.value = withTiming(
        index === page ? theme.mauve12.val : theme.mauve11.val,
        {
          duration: 300,
        },
      );
    }
  }, [page, theme.mauve11.val, theme.mauve12.val]);

  return (
    <View flex={1} backgroundColor="$color1">
      <Animated.View style={animatedHeaderStyle}>
        <BlurView
          intensity={25}
          tint={rootTheme}
          style={{
            flexGrow: 1,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        <View
          backgroundColor="$color1"
          flexGrow={1}
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.75}
          borderBottomWidth="$0.5"
          borderBottomColor="$borderColorBg"
        />
        <YStack paddingHorizontal="$3">
          <View
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            paddingVertical="$2"
          >
            <DrawerToggleButton />
            <NookText fontSize="$5" fontWeight="600">
              {title}
            </NookText>
            <IconButton icon={Search} onPress={() => {}} />
          </View>
          <XStack height={40}>
            {pages.map(({ name }, index) => (
              <View
                key={name}
                alignItems="center"
                justifyContent="flex-end"
                style={{ flex: 1 }}
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  tabWidths.current[index] = width;
                  if (index === page) {
                    indicatorWidth.value = width;
                    indicatorPosition.value = event.nativeEvent.layout.x;
                  }
                }}
                paddingHorizontal="$2"
                paddingBottom="$3"
              >
                <View
                  onLayout={(event) => {
                    const { width } = event.nativeEvent.layout;
                    textWidths.current[index] = width + 10;
                    if (index === page) {
                      textWidth.value = width + 10;
                    }
                  }}
                >
                  <Animated.Text
                    style={useAnimatedStyle(() => ({
                      color: textColorValues.current[index].value,
                      fontWeight: "600",
                      fontSize: 15,
                    }))}
                  >
                    {name}
                  </Animated.Text>
                </View>
              </View>
            ))}
            <Animated.View style={animatedIndicatorStyle}>
              <Animated.View style={animatedTextIndicatorStyle} />
            </Animated.View>
          </XStack>
        </YStack>
      </Animated.View>
      <PagerView
        ref={ref}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => {
          setPage(e.nativeEvent.position);
          setIsScrolling(false);
        }}
        onPageScroll={(e) => {
          const position = e.nativeEvent.position;
          const offset = e.nativeEvent.offset;
          const totalWidthBeforeCurrent = tabWidths.current
            .slice(0, position)
            .reduce((acc, width) => acc + width, 0);
          const currentTabWidth = tabWidths.current[position];
          const nextTabWidth =
            tabWidths.current[position + 1] || currentTabWidth; // Handle edge case for the last tab
          const interpolatedWidth =
            currentTabWidth + (nextTabWidth - currentTabWidth) * offset;
          const interpolatedPosition =
            totalWidthBeforeCurrent + currentTabWidth * offset;

          indicatorWidth.value = interpolatedWidth;
          indicatorPosition.value = interpolatedPosition;

          const currentTextWidth = textWidths.current[position];
          const nextTextWidth =
            textWidths.current[position + 1] || currentTextWidth; // Handle edge case for the last tab
          const interpolatedTextWidth =
            currentTextWidth + (nextTextWidth - currentTextWidth) * offset;

          textWidth.value = interpolatedTextWidth;

          // Interpolate text color for current and next tab
          if (position < textColorValues.current.length - 1) {
            textColorValues.current[position].value = interpolateColor(
              offset,
              [0, 1],
              [theme.mauve12.val, theme.mauve11.val],
            );
            textColorValues.current[position + 1].value = interpolateColor(
              offset,
              [0, 1],
              [theme.mauve11.val, theme.mauve12.val],
            );
          }
        }}
        useNext
      >
        {pages.map(({ component }, index) => (
          <LazyLoadView key={index + 1} index={index} currentIndex={page}>
            {component}
          </LazyLoadView>
        ))}
      </PagerView>
    </View>
  );
};

const LazyLoadView = ({
  currentIndex,
  index,
  children,
}: { currentIndex: number; index: number; children: ReactNode }) => {
  const [rendered, setRendered] = useState(false);
  const isActive = Math.abs(currentIndex - index) <= 1;

  useEffect(() => {
    if (isActive && !rendered) setRendered(true);
  }, [isActive, rendered]);

  if (!rendered) {
    return (
      <View key={index + 1}>
        <Spinner />
      </View>
    );
  }

  return (
    <View key={index + 1} flex={1}>
      {children}
    </View>
  );
};
