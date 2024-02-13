import { PlatformPressable } from "@react-navigation/elements";
import {
  DrawerActions,
  useNavigation,
  useRoute,
  RouteProp,
} from "@react-navigation/native";
import { Platform } from "react-native";
import { useDrawerStatus } from "@react-navigation/drawer";
import { useEffect } from "react";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setDrawerOpen } from "@/store/drawer";
import { View } from "tamagui";
import ShelfScreen from "@/screens/ShelfScreen";
import { RootStackParamList } from "@/types";
import { useAppSelector } from "@/hooks/useAppSelector";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

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
  const route = useRoute<RouteProp<RootStackParamList, "Nook">>();

  const nooks = useAppSelector((state) => state.user.nooks);
  const activeShelves = useAppSelector((state) => state.user.activeShelves);

  const activeNook =
    nooks.find((nook) => nook.id === route.params.nookId) || nooks[0];

  const activeShelf =
    activeNook.shelves.find(
      (shelf) => shelf.id === activeShelves[activeNook.id],
    ) || activeNook.shelves[0];

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Shelf"
        component={ShelfScreen}
        initialParams={{
          nookId: activeNook.id,
          shelfId: activeShelf.id,
        }}
        options={{
          title: activeShelf.name,
          headerLeft: () => <DrawerToggleButton />,
          headerBackground: () => (
            <View
              backgroundColor="$background"
              theme={activeNook.theme}
              height="100%"
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
}
