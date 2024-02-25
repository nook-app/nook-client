import { PlatformPressable } from "@react-navigation/elements";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Platform } from "react-native";
import { useDrawerStatus } from "@react-navigation/drawer";
import { memo, useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setDrawerOpen } from "@/store/slices/navigator";
import { Avatar, View, useTheme } from "tamagui";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ContentScreen from "@/screens/ContentScreen";
import { RootStackParamList } from "@/types";
import { Text } from "tamagui";
import { useNooks } from "@/hooks/useNooks";
import { EntityScreen } from "@/screens/EntityScreen";
import { NookScreen } from "@/screens/NookScreen";
import { ChannelScreen } from "@/screens/ChannelScreen";

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
  const theme = useTheme();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Nook"
        component={NookScreen}
        initialParams={{ nookId: activeNook?.nookId }}
        options={{
          headerLeft: () => <DrawerToggleButton />,
          headerStyle: {
            backgroundColor: theme.$background.val,
          },
          headerTitleStyle: {
            fontWeight: "700",
          },
          headerTitle: (props) => <Text {...props} fontWeight="700" />,
        }}
      />
      <Stack.Screen
        name="Content"
        component={ContentScreen}
        options={{
          headerBackTitleVisible: false,
          headerTintColor: "white",
          headerStyle: {
            backgroundColor: theme.$background.val,
          },
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
        getId={({ params }) => params.contentId}
      />
      <Stack.Screen
        name="Entity"
        component={EntityScreen}
        options={{
          headerBackTitleVisible: false,
          headerTintColor: "white",
          headerStyle: {
            backgroundColor: theme.$background.val,
          },
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
        getId={({ params }) => params.entityId}
      />
      <Stack.Screen
        name="Channel"
        component={ChannelScreen}
        options={{
          headerBackTitleVisible: false,
          headerTintColor: "white",
          headerStyle: {
            backgroundColor: theme.$background.val,
          },
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          headerTitle: (props) => <Text {...props} fontWeight="700" />,
        }}
        getId={({ params }) => params.channelId}
      />
    </Stack.Navigator>
  );
}
