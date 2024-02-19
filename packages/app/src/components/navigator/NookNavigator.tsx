import { PlatformPressable } from "@react-navigation/elements";
import {
  DrawerActions,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { Platform } from "react-native";
import { useDrawerStatus } from "@react-navigation/drawer";
import { useEffect } from "react";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setDrawerOpen } from "@/store/slices/drawer";
import { View } from "tamagui";
import ShelfScreen from "@/screens/ShelfScreen";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ContentScreen from "@/screens/ContentScreen";
import { RootStackParamList } from "@/types";
import { CreatePostModal } from "@/modals/CreatePostModal";
import { Text } from "tamagui";
import { store } from "@/store";

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
  const route = useRoute<RouteProp<RootStackParamList, "Nook">>();
  const nooks = store.getState().user.nooks;
  const nookId = route?.params?.nookId || nooks[0]?.nookId;

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Shelf"
        component={ShelfScreen}
        initialParams={{ nookId }}
        options={{
          headerLeft: () => <DrawerToggleButton />,
          headerBackground: () => <HeaderBackground />,
          headerTitle: (props) => <Text {...props} />,
        }}
      />
      <Stack.Screen
        name="Content"
        component={ContentScreen}
        options={{
          headerBackTitleVisible: false,
          headerTintColor: "white",
          headerBackground: () => <HeaderBackground />,
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
        getId={({ params }) => params.contentId}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostModal}
        options={{
          presentation: "fullScreenModal",
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

const HeaderBackground = () => {
  const theme = useAppSelector((state) => state.user.theme);
  return <View backgroundColor="$background" theme={theme} height="100%" />;
};
