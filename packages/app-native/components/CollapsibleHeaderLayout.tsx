import { router } from "expo-router";
import { NookText, View, XStack } from "@nook/app-ui";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { ReactNode, useCallback } from "react";
import { CollapsibleLayout } from "./CollapsibleLayout";
import { IconButton } from "./IconButton";
import {
  useCurrentTabScrollY,
  useHeaderMeasurements,
} from "react-native-collapsible-tab-view";
import { useScroll } from "@nook/app/context/scroll";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
} from "react-native-reanimated";
import { NAVIGATION_HEIGHT, TAB_HEIGHT } from "./PagerLayout";

export const CollapsibleHeaderLayout = ({
  title,
  pages,
  defaultIndex = 0,
  right,
}: {
  title: string;
  pages: { name: string; component: ReactNode }[];
  defaultIndex?: number;
  right?: ReactNode;
}) => {
  const renderHeader = useCallback(
    () => <CollapsibleHeader title={title} right={right} />,
    [title, right],
  );

  return (
    <View flex={1} backgroundColor="$color1">
      <CollapsibleLayout
        renderHeader={renderHeader}
        pages={pages}
        defaultIndex={defaultIndex}
        minHeaderHeight={TAB_HEIGHT}
      />
    </View>
  );
};

const CollapsibleHeader = ({
  title,
  right,
}: {
  title: string;
  right?: ReactNode;
}) => {
  const scrollY = useCurrentTabScrollY();

  const { setIsScrolling } = useScroll();

  useAnimatedReaction(
    () => scrollY.value,
    (currentScrollY, previousScrollY) => {
      const delta = currentScrollY - (previousScrollY ?? 0);
      if (delta > 0 && currentScrollY > 50) {
        runOnJS(setIsScrolling)(true);
      } else if (delta < -25) {
        runOnJS(setIsScrolling)(false);
      }
    },
    [scrollY],
  );

  const headerTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 30],
      [1, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
    };
  });

  const { top } = useHeaderMeasurements();

  const stylez = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: -top.value,
        },
      ],
    };
  });

  return (
    <Animated.View style={stylez}>
      <View
        height={NAVIGATION_HEIGHT}
        justifyContent="flex-end"
        paddingHorizontal="$3"
      >
        <Animated.View style={headerTitleStyle}>
          <XStack justifyContent="space-between" alignItems="center">
            <IconButton icon={ArrowLeft} onPress={router.back} />
            <NookText fontSize="$5" fontWeight="600">
              {title}
            </NookText>
            {right || <View width="$2.5" />}
          </XStack>
        </Animated.View>
      </View>
    </Animated.View>
  );
};
