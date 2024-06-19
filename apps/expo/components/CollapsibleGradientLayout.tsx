import { router } from "expo-router";
import { View, XStack } from "@nook/app-ui";
import { ArrowLeft } from "@tamagui/lucide-icons";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { ReactNode, memo, useCallback } from "react";
import {
  useCurrentTabScrollY,
  useHeaderMeasurements,
} from "react-native-collapsible-tab-view";
import { useTheme } from "@nook/app/context/theme";
import { IconButton } from "./IconButton";
import { useImageColors } from "../hooks/useImageColors";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useScroll } from "@nook/app/context/scroll";
import { CollapsibleLayout } from "./CollapsibleLayout";
import { NAVIGATION_HEIGHT } from "./PagerLayout";

export const CollapsibleGradientLayout = ({
  title,
  header,
  pages,
  src,
  right,
  fallbackSrc,
}: {
  title: ReactNode;
  header: ReactNode;
  pages: { name: string; component: ReactNode }[];
  src?: string;
  right?: ReactNode;
  fallbackSrc?: string;
}) => {
  const renderHeader = useCallback(() => {
    return (
      <CollapsibleGradientHeader
        title={title}
        header={header}
        pages={pages}
        src={src}
        fallbackSrc={fallbackSrc}
        right={right}
      />
    );
  }, [title, header, pages, src, right, fallbackSrc]);

  return (
    <View flex={1} backgroundColor="$color1">
      <CollapsibleLayout renderHeader={renderHeader} pages={pages} />
    </View>
  );
};

export const CollapsibleGradientHeader = memo(
  ({
    title,
    header,
    pages,
    src,
    right,
    fallbackSrc,
  }: {
    title: ReactNode;
    header: ReactNode;
    pages: { name: string; component: ReactNode }[];
    src?: string;
    fallbackSrc?: string;
    right?: ReactNode;
  }) => {
    const { rootTheme } = useTheme();
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

    const headerBackgroundStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        scrollY.value,
        [0, 50, 100],
        [0, 0, 1],
        Extrapolation.CLAMP,
      );

      return {
        opacity,
      };
    });

    const headerTitleStyle = useAnimatedStyle(() => {
      const translateY = interpolate(
        scrollY.value,
        [0, 100],
        [50, 0],
        Extrapolation.CLAMP,
      );
      const opacity = interpolate(
        scrollY.value,
        [0, 70, 100],
        [0, 0, 1],
        Extrapolation.CLAMP,
      );

      return {
        transform: [{ translateY }],
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
      <View>
        <Animated.View style={stylez}>
          <View
            height={NAVIGATION_HEIGHT}
            paddingHorizontal="$3"
            backgroundColor="$color1"
            justifyContent="flex-end"
          >
            <Animated.View
              style={[
                {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  flex: 1,
                },
                headerBackgroundStyle,
              ]}
            >
              <Gradient src={src} />
              <BlurView
                intensity={50}
                tint={rootTheme}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  flex: 1,
                }}
              />
            </Animated.View>
            <XStack
              alignItems="center"
              justifyContent="space-between"
              gap="$2"
              paddingVertical="$2"
            >
              <XStack gap="$4" alignItems="center" flexShrink={1}>
                <IconButton icon={ArrowLeft} onPress={router.back} />
                <Animated.View style={[headerTitleStyle, { flexShrink: 1 }]}>
                  {title}
                </Animated.View>
              </XStack>
              {right}
            </XStack>
          </View>
        </Animated.View>
        <View zIndex={-1}>{header}</View>
      </View>
    );
  },
);

const Gradient = ({
  src,
  fallbackSrc,
}: { src?: string; fallbackSrc?: string }) => {
  const colors = useImageColors(src);
  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      colors={[
        colors.backgroundColor,
        colors.primaryColor,
        colors.secondaryColor,
        colors.backgroundColor,
      ]}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        opacity: 0.5,
      }}
    />
  );
};
