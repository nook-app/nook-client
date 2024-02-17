import { PlatformPressable } from "@react-navigation/elements";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Platform } from "react-native";
import { useDrawerStatus } from "@react-navigation/drawer";
import { useEffect } from "react";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setDrawerOpen } from "@/store/drawer";
import { View } from "tamagui";
import ShelfScreen from "@/screens/ShelfScreen";
import { useAppSelector } from "@/hooks/useAppSelector";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ContentScreen from "@/screens/ContentScreen";
import { RootStackParamList } from "@/types";
import { EnableSignerModal } from "@/modals/EnableSignerModal";
import { CreatePostModal } from "@/modals/CreatePostModal";

const Stack = createNativeStackNavigator<RootStackParamList>();

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
      <ArrowLeft size={24} />
    </PlatformPressable>
  );
};

export function NookNavigator() {
  const activeNook = useAppSelector((state) => state.user.activeNook);
  const activeShelves = useAppSelector((state) => state.user.activeShelves);
  const activeShelf = activeNook
    ? activeShelves[activeNook.id] || activeNook.shelves[0]
    : undefined;

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Shelf"
        component={ShelfScreen}
        initialParams={{ nookId: activeNook?.id, shelfId: activeShelf?.id }}
        options={{
          title: activeShelf?.name,
          headerLeft: () => <DrawerToggleButton />,
          headerBackground: () => (
            <View
              backgroundColor="$background"
              theme={activeNook?.theme}
              height="100%"
            />
          ),
        }}
      />
      <Stack.Screen
        name="Content"
        component={ContentScreen}
        options={{
          headerBackTitleVisible: false,
          headerTintColor: "white",
          headerBackground: () => (
            <View
              backgroundColor="$background"
              theme={activeNook?.theme}
              height="100%"
            />
          ),
        }}
        getId={({ params }) => params.contentId}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostModal}
        options={{
          presentation: "transparentModal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EnableSigner"
        component={EnableSignerModal}
        options={{
          presentation: "transparentModal",
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
