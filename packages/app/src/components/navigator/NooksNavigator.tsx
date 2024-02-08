import SlotsScreen from "@/screens/SlotsScreen";
import {
  DrawerContentScrollView,
  createDrawerNavigator,
} from "@react-navigation/drawer";

import { PlatformPressable } from "@react-navigation/elements";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Platform } from "react-native";
import { useDrawerStatus } from "@react-navigation/drawer";
import { useEffect } from "react";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setDrawerOpen } from "@/store/drawer";
import { Text, View, XStack, YStack, useTheme } from "tamagui";
import { TEMPLATE_NOOKS } from "@/constants/nooks";
import { Image } from "expo-image";
import DrawerItemList from "../drawer/DrawerItemList";
import { useAppSelector } from "@/hooks/useAppSelector";
import { setActiveNook } from "@/store/user";

const Drawer = createDrawerNavigator();

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

export function NooksNavigator() {
  const theme = useTheme();
  const activeNook = useAppSelector((state) => state.user.activeNook);
  const dispatch = useAppDispatch();

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <XStack theme="gray" height="100%">
          <YStack>
            <DrawerContentScrollView {...props}>
              <YStack>
                <DrawerItemList
                  {...props}
                  onPress={({ params }) =>
                    dispatch(
                      setActiveNook((params as { nookId: string }).nookId),
                    )
                  }
                />
              </YStack>
            </DrawerContentScrollView>
          </YStack>
          <YStack backgroundColor="$backgroundFocus" flexGrow={1}>
            <DrawerContentScrollView {...props}>
              <YStack theme={activeNook?.theme} padding="$2">
                <View
                  padding="$2"
                  justifyContent="center"
                  alignItems="center"
                  borderColor="$borderColor"
                  borderBottomWidth="$1.5"
                  borderRadius="$4"
                  backgroundColor="$backgroundStrong"
                >
                  <Text letterSpacing={1}>{activeNook?.name}</Text>
                </View>
              </YStack>
            </DrawerContentScrollView>
          </YStack>
        </XStack>
      )}
    >
      {TEMPLATE_NOOKS.map((nook) => (
        <Drawer.Screen
          key={nook.id}
          name={nook.name}
          component={SlotsScreen}
          initialParams={{
            nookId: nook.id,
          }}
          options={{
            headerLeft: () => <DrawerToggleButton />,
            headerBackground: () => (
              <View
                backgroundColor="$background"
                theme={nook.theme}
                height="100%"
              />
            ),
            drawerIcon: () => (
              <View borderRadius="$10" overflow="hidden">
                <Image source={nook.image} style={{ width: 32, height: 32 }} />
              </View>
            ),
            drawerActiveBackgroundColor: theme.$gray4.val,
          }}
        />
      ))}
    </Drawer.Navigator>
  );
}
