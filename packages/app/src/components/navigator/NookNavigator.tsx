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
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setDrawerOpen } from "@/store/slices/navigator";
import { Avatar, View } from "tamagui";
import ShelfScreen from "@/screens/ShelfScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ContentScreen from "@/screens/ContentScreen";
import { RootStackParamList } from "@/types";
import { CreatePostModal } from "@/modals/CreatePostModal";
import { Text } from "tamagui";
import { store } from "@/store";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectNookById } from "@/store/slices/nook";

const Stack = createNativeStackNavigator<RootStackParamList>();

const DrawerToggleButton = () => {
  const navigation = useNavigation();
  const drawerStatus = useDrawerStatus();
  const dispatch = useAppDispatch();
  const {
    params: { nookId },
  } = useRoute<RouteProp<RootStackParamList, "Shelf">>();

  const nook = useAppSelector((state) => selectNookById(state, nookId));

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
      <Avatar circular size="$1.5">
        <Avatar.Image src={nook?.image} />
        <Avatar.Fallback backgroundColor="$backgroundPress" />
      </Avatar>
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
