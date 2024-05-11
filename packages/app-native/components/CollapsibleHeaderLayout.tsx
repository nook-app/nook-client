import { router } from "expo-router";
import { NookText, View, XStack } from "@nook/app-ui";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { useCallback } from "react";
import { CollapsibleLayout } from "./CollapsibleLayout";
import { IconButton } from "./IconButton";
import { useCurrentTabScrollY } from "react-native-collapsible-tab-view";
import { useScroll } from "@nook/app/context/scroll";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
} from "react-native-reanimated";

export const CollapsibleHeaderLayout = ({
  title,
  pages,
  defaultIndex = 0,
}: {
  title: string;
  pages: { name: string; component: React.ReactNode }[];
  defaultIndex?: number;
}) => {
  const renderHeader = useCallback(
    () => <CollapsibleHeader title={title} />,
    [title],
  );

  return (
    <CollapsibleLayout
      renderHeader={renderHeader}
      pages={pages}
      defaultIndex={defaultIndex}
    />
  );
};

const CollapsibleHeader = ({
  title,
}: {
  title: string;
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

  return (
    <View height={40} justifyContent="flex-end" backgroundColor="$color1">
      <Animated.View style={headerTitleStyle}>
        <XStack justifyContent="space-between" alignItems="center">
          <IconButton icon={ArrowLeft} onPress={router.back} />
          <NookText fontSize="$5" fontWeight="600">
            {title}
          </NookText>
          <View />
        </XStack>
      </Animated.View>
    </View>
  );
};
