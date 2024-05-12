import {
  Spinner,
  View,
  XStack,
  useTheme as useTamaguiTheme,
} from "@nook/app-ui";
import { useScroll } from "@nook/app/context/scroll";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ReactNode, useEffect, useRef, useState } from "react";
import PagerView from "react-native-pager-view";
import { DisappearingLayout } from "./DisappearingLayout";

export const NAVIGATION_HEIGHT = 94;
export const TAB_HEIGHT = 40;
export const HEADER_HEIGHT = NAVIGATION_HEIGHT + TAB_HEIGHT;

export const PagerLayout = ({
  title,
  pages,
}: {
  title: ReactNode;
  pages: { name: string; component: ReactNode }[];
}) => {
  const theme = useTamaguiTheme();
  const { setIsScrolling } = useScroll();

  // @ts-ignore
  const ref = useRef<PagerView>(null);
  const [page, setPage] = useState(0);

  const tabWidths = useRef(new Array(pages.length).fill(0));
  const indicatorWidth = useSharedValue(0);
  const indicatorPosition = useSharedValue(0);
  const textWidths = useRef(new Array(pages.length).fill(0));
  const textWidth = useSharedValue(0);

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
    <DisappearingLayout
      title={title}
      navigation={
        pages.length > 0 ? (
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
                onPress={() => {
                  ref.current?.setPage(index);
                }}
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
        ) : null
      }
    >
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
            tabWidths.current[position + 1] || currentTabWidth;
          const interpolatedWidth =
            currentTabWidth + (nextTabWidth - currentTabWidth) * offset;
          const interpolatedPosition =
            totalWidthBeforeCurrent + currentTabWidth * offset;

          indicatorWidth.value = interpolatedWidth;
          indicatorPosition.value = interpolatedPosition;

          const currentTextWidth = textWidths.current[position];
          const nextTextWidth =
            textWidths.current[position + 1] || currentTextWidth;
          const interpolatedTextWidth =
            currentTextWidth + (nextTextWidth - currentTextWidth) * offset;

          textWidth.value = interpolatedTextWidth;

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
        useNext={false}
      >
        {pages.map(({ component }, index) => (
          <LazyLoadView key={index + 1} index={index} currentIndex={page}>
            {component}
          </LazyLoadView>
        ))}
      </PagerView>
    </DisappearingLayout>
  );
};

const LazyLoadView = ({
  currentIndex,
  index,
  children,
}: { currentIndex: number; index: number; children: ReactNode }) => {
  const [rendered, setRendered] = useState(false);
  const isActive = Math.abs(currentIndex - index) <= 0;

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
