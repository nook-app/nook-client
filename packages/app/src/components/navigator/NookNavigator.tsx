import { PlatformPressable } from "@react-navigation/elements";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Platform } from "react-native";
import { useDrawerStatus } from "@react-navigation/drawer";
import { memo, useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setDrawerOpen } from "@/store/slices/navigator";
import { Avatar, View } from "tamagui";
import ShelfScreen from "@/screens/ShelfScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ContentScreen from "@/screens/ContentScreen";
import { RootStackParamList } from "@/types";
import { Text } from "tamagui";
import { useNooks } from "@/hooks/useNooks";

const Stack = createNativeStackNavigator<RootStackParamList>();

const ActiveNookIcon = memo(() => {
  const { activeNook } = useNooks();

  return (
    <Avatar circular size="$1.5">
      <Avatar.Image src={activeNook?.image} />
      <Avatar.Fallback backgroundColor="$backgroundPress" />
    </Avatar>
  );
});

const DrawerToggleButton = () => {
  const navigation = useNavigation();
  const drawerStatus = useDrawerStatus();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setDrawerOpen(drawerStatus === "open"));
  }, [drawerStatus, dispatch]);

  return (
    <PlatformPressable
      accessible
      accessibilityRole="button"
      android_ripple={{ borderless: true }}
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      style={{
        marginHorizontal: 11,
      }}
      hitSlop={Platform.select({
        ios: undefined,
        default: { top: 16, right: 16, bottom: 16, left: 16 },
      })}
    >
      <ActiveNookIcon />
    </PlatformPressable>
  );
};

export function NookNavigator() {
  const { activeNook } = useNooks();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Shelf"
        component={ShelfScreen}
        initialParams={{ nookId: activeNook?.nookId }}
        options={{
          headerLeft: () => <DrawerToggleButton />,
          headerBackground: () => (
            <View backgroundColor="$background" height="100%" />
          ),
          headerTitle: (props) => <Text {...props} />,
        }}
      />
      <Stack.Screen
        name="Content"
        component={ContentScreen}
        options={{
          headerBackTitleVisible: false,
          headerTintColor: "white",
          headerBackground: () => (
            <View backgroundColor="$background" height="100%" />
          ),
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
        getId={({ params }) => params.contentId}
      />
    </Stack.Navigator>
  );
}
