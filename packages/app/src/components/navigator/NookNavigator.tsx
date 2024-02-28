import { PlatformPressable } from "@react-navigation/elements";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Platform } from "react-native";
import { useDrawerStatus } from "@react-navigation/drawer";
import { memo, useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setDrawerOpen } from "@/store/slices/navigator";
import { View, useTheme } from "tamagui";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ContentScreen from "@/screens/FarcasterCastScreen";
import { RootStackParamList } from "@/types";
import { Text } from "tamagui";
import { useNooks } from "@/hooks/useNooks";
import { EntityScreen } from "@/screens/EntityScreen";
import { NookScreen } from "@/screens/NookScreen";
import { ChannelScreen } from "@/screens/ChannelScreen";
import { EntityFollowersScreen } from "@/screens/EntityFollowersScreen";
import { ContentLikesScreen } from "@/screens/FarcasterCastLikesScreen";
import { ContentRepostsScreen } from "@/screens/FarcasterCastRepostsScreen";
import { ContentQuotesScreen } from "@/screens/FarcasterCastQuotesScreen";
import { Image } from "expo-image";

const Stack = createNativeStackNavigator<RootStackParamList>();

const ActiveNookIcon = memo(() => {
  const { activeNook } = useNooks();

  return (
    <View
      borderRadius="$10"
      justifyContent="center"
      alignItems="center"
      backgroundColor="$backgroundPress"
      style={{
        width: 24,
        height: 24,
      }}
    >
      <Image
        source={activeNook.imageUrl}
        tintColor="white"
        style={{
          width: 16,
          height: 16,
        }}
      />
    </View>
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
  const theme = useTheme();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Nook"
        component={NookScreen}
        initialParams={{}}
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
        name="FarcasterChannel"
        component={ChannelScreen}
        options={{
          headerBackTitleVisible: false,
          headerTintColor: "white",
          headerStyle: {
            backgroundColor: theme.$background.val,
          },
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
        getId={({ params }) => params.channelId}
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
        name="EntityFollowers"
        component={EntityFollowersScreen}
        options={{
          headerBackTitleVisible: false,
          headerTintColor: "white",
          headerStyle: {
            backgroundColor: theme.$background.val,
          },
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="FarcasterCast"
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
        getId={({ params }) => params.hash}
      />
      <Stack.Screen
        name="FarcasterCastLikes"
        component={ContentLikesScreen}
        options={{
          title: "Likes",
          headerBackTitleVisible: false,
          headerTintColor: "white",
          headerStyle: {
            backgroundColor: theme.$background.val,
          },
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
        getId={({ params }) => params.hash}
      />
      <Stack.Screen
        name="FarcasterCastReposts"
        component={ContentRepostsScreen}
        options={{
          title: "Reposts",
          headerBackTitleVisible: false,
          headerTintColor: "white",
          headerStyle: {
            backgroundColor: theme.$background.val,
          },
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
        getId={({ params }) => params.hash}
      />
      <Stack.Screen
        name="FarcasterCastQuotes"
        component={ContentQuotesScreen}
        options={{
          title: "Quotes",
          headerBackTitleVisible: false,
          headerTintColor: "white",
          headerStyle: {
            backgroundColor: theme.$background.val,
          },
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
        getId={({ params }) => params.hash}
      />
    </Stack.Navigator>
  );
}
