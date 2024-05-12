import { NookText, View, YStack } from "@nook/app-ui";
import { IconButton } from "./IconButton";
import { Search } from "@tamagui/lucide-icons";
import { DrawerToggleButton } from "./DrawerToggleButton";
import { useTheme } from "@nook/app/context/theme";
import { BlurView } from "expo-blur";
import { useScroll } from "@nook/app/context/scroll";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ReactNode, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const DEFAULT_HEIGHT = 94;
export const NAVIGATION_HEIGHT = 40;
export const HEADER_HEIGHT = DEFAULT_HEIGHT + NAVIGATION_HEIGHT;

export const DisappearingLayout = ({
  title,
  navigation,
  children,
}: { title: ReactNode; navigation: ReactNode; children: ReactNode }) => {
  const { rootTheme } = useTheme();
  const { isScrolling } = useScroll();
  const insets = useSafeAreaInsets();

  const fullHeaderHeight = HEADER_HEIGHT;

  const headerHeight = useSharedValue(isScrolling ? 0 : fullHeaderHeight);
  const headerPaddingTop = useSharedValue(isScrolling ? 0 : insets.top);
  const headerOpacity = useSharedValue(isScrolling ? 0 : 1);

  useEffect(() => {
    headerHeight.value = withTiming(isScrolling ? 0 : fullHeaderHeight, {
      duration: 100,
    });
    headerPaddingTop.value = withTiming(isScrolling ? 0 : insets.top, {
      duration: 100,
    });
    headerOpacity.value = withTiming(isScrolling ? 0 : 1, { duration: 100 });
  }, [
    isScrolling,
    headerHeight,
    headerPaddingTop,
    insets.top,
    headerOpacity,
    fullHeaderHeight,
  ]);

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
          {navigation}
        </YStack>
      </Animated.View>
      {children}
    </View>
  );
};
