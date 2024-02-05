import { Redirect, Stack, useNavigation } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";

import { useAuth } from "../../context/auth";
import {
  Button,
  Image,
  Text,
  View,
  XStack,
  YStack,
  getToken,
  getTokens,
} from "tamagui";
import { PlatformPressable } from "@react-navigation/elements";
import { DrawerActions, ParamListBase } from "@react-navigation/native";
import { Platform } from "react-native";
import {
  DrawerContentScrollView,
  DrawerNavigationProp,
} from "@react-navigation/drawer";

export default function AuthedLayout() {
  const { session, signOut } = useAuth();

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          drawerStyle: {
            width: getToken("$20"),
          },
        }}
        drawerContent={(props) => (
          <View backgroundColor="$background" theme="pink" height="100%">
            <DrawerContentScrollView {...props}>
              <YStack padding="$2" gap="$2">
                <XStack gap="$2" alignItems="center">
                  <Image
                    source={{
                      width: 40,
                      height: 40,
                      uri: session?.entity?.farcaster?.pfp,
                    }}
                    borderRadius="$10"
                  />
                  <YStack>
                    <Text fontWeight="700" fontSize="$5">
                      {session?.entity?.farcaster?.displayName}
                    </Text>
                    <Text color="$gray11" fontSize="$4">
                      {`@${session?.entity?.farcaster?.username}`}
                    </Text>
                  </YStack>
                </XStack>
                <Button
                  onPress={() => {
                    signOut();
                  }}
                >
                  Sign Out
                </Button>
              </YStack>
            </DrawerContentScrollView>
          </View>
        )}
      >
        <Drawer.Screen
          name="nooks"
          options={{
            headerLeft: () => (
              <DrawerToggleButton src={session?.entity?.farcaster?.pfp} />
            ),
            headerBackground: () => (
              <View backgroundColor="$background" theme="pink" height="100%" />
            ),
            headerTitle: "Home",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const DrawerToggleButton = ({ src }: { src?: string }) => {
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();

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
      <Image
        source={{
          width: 40,
          height: 40,
          uri: src,
        }}
        borderRadius="$10"
      />
    </PlatformPressable>
  );
};
