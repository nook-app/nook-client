import { Stack, router } from "expo-router";
import { View, XStack } from "@nook/app-ui";
import { ArrowLeft } from "@tamagui/lucide-icons";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { ReactNode, useCallback } from "react";
import { useCurrentTabScrollY } from "react-native-collapsible-tab-view";
import { useTheme } from "@nook/app/context/theme";
import { IconButton } from "./IconButton";
import { useImageColors } from "../hooks/useImageColors";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useScroll } from "@nook/app/context/scroll";
import { CollapsibleLayout } from "./CollapsibleLayout";

export const CollapsibleGradientLayout = ({
  title,
  header,
  pages,
  src,
  right,
}: {
  title: ReactNode;
  header: ReactNode;
  pages: { name: string; component: ReactNode }[];
  src?: string;
  right?: ReactNode;
}) => {
  const renderHeader = useCallback(
    () => (
      <CollapsibleGradientHeader
        title={title}
        header={header}
        pages={pages}
        src={src}
        right={right}
      />
    ),
    [title, header, pages, src, right],
  );

  return <CollapsibleLayout renderHeader={renderHeader} pages={pages} />;
};

export const CollapsibleGradientHeader = ({
  title,
  header,
  pages,
  src,
  right,
}: {
  title: ReactNode;
  header: ReactNode;
  pages: { name: string; component: ReactNode }[];
  src?: string;
  right?: ReactNode;
}) => {
  const { rootTheme } = useTheme();
  const scrollY = useCurrentTabScrollY();
  const insets = useSafeAreaInsets();
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

  return (
    <View flexGrow={1} backgroundColor="$color1">
      <Stack.Screen
        options={{
          header: () => (
            <View
              height={94}
              paddingTop={insets.top}
              paddingHorizontal="$3"
              backgroundColor="$color1"
              justifyContent="center"
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
          ),
        }}
      />
      {header}
    </View>
  );
};

const Gradient = ({ src }: { src?: string }) => {
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
