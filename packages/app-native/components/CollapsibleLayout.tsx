import { Stack, router } from "expo-router";
import { View, XStack, useTheme as useTamaguiTheme } from "@nook/app-ui";
import { ArrowLeft, Search, MoreHorizontal } from "@tamagui/lucide-icons";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { ReactNode, useCallback, useEffect, useState } from "react";
import {
  MaterialTabBar,
  TabBarProps,
  Tabs,
  useCurrentTabScrollY,
} from "react-native-collapsible-tab-view";
import { useTheme } from "@nook/app/context/theme";
import { IconButton } from "./IconButton";
import { Colors } from "../hooks/useImageColors";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useScroll } from "@nook/app/context/scroll";

export const CollapsibleLayout = ({
  title,
  header,
  pages,
  colors,
}: {
  title: ReactNode;
  header: ReactNode;
  pages: { name: string; component: ReactNode }[];
  colors: Colors;
}) => {
  const theme = useTamaguiTheme();

  const renderTabBar = useCallback(
    (props: TabBarProps) => {
      return (
        <MaterialTabBar
          {...props}
          style={{
            backgroundColor: theme.color1.val,
          }}
          labelStyle={{
            fontWeight: "600",
            textTransform: "capitalize",
            fontSize: 15,
          }}
          activeColor={theme.mauve12.val}
          inactiveColor={theme.mauve11.val}
          indicatorStyle={{
            backgroundColor: theme.color11.val,
            height: 3,
            borderRadius: 9,
          }}
          tabStyle={{
            height: "auto",
            paddingVertical: 8,
            paddingHorizontal: 2,
            marginHorizontal: props.tabNames.length > 1 ? 4 : 0,
          }}
          scrollEnabled
          keepActiveTabCentered
        />
      );
    },
    [theme],
  );

  const renderHeader = useCallback(() => {
    return (
      <CollapsibleLayoutHeader title={title} header={header} colors={colors} />
    );
  }, [title, header, colors]);

  return (
    <View flex={1} backgroundColor="$color1">
      <Tabs.Container
        initialTabName={pages[0]?.name}
        renderHeader={renderHeader}
        renderTabBar={renderTabBar}
        headerContainerStyle={{
          shadowOpacity: 0,
          elevation: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.borderColor.val,
        }}
        containerStyle={{
          backgroundColor: theme.color1.val,
        }}
        lazy
      >
        {pages.map((page) => (
          <Tabs.Tab key={page.name} name={page.name}>
            {page.component}
          </Tabs.Tab>
        ))}
      </Tabs.Container>
    </View>
  );
};

const CollapsibleLayoutHeader = ({
  title,
  header,
  colors,
}: { title: ReactNode; header: ReactNode; colors: Colors }) => {
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
    <View backgroundColor="$color1">
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
              <XStack alignItems="center" justifyContent="space-between">
                <XStack gap="$4" alignItems="center">
                  <IconButton icon={ArrowLeft} onPress={router.back} />
                  <Animated.View style={[headerTitleStyle]}>
                    {title}
                  </Animated.View>
                </XStack>
                <XStack gap="$2" justifyContent="flex-end">
                  <IconButton icon={Search} onPress={() => {}} />
                  <IconButton icon={MoreHorizontal} onPress={() => {}} />
                </XStack>
              </XStack>
            </View>
          ),
        }}
      />
      {header}
    </View>
  );
};
