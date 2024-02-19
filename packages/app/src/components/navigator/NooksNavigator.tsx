import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  createDrawerNavigator,
} from "@react-navigation/drawer";
import {
  useNavigation,
  NavigationProp,
  getFocusedRouteNameFromRoute,
} from "@react-navigation/native";
import { Separator, Text, View, XStack, YStack } from "tamagui";
import { Image } from "expo-image";
import { RootStackParamList } from "@/types";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { NookNavigator } from "./NookNavigator";
import { Nook } from "@nook/common/types";
import { selectNookById } from "@/store/slices/nook";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setTheme } from "@/store/slices/user";
import { useEffect } from "react";

const Drawer = createDrawerNavigator();

export function NooksNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={({ route }) => {
        return {
          swipeEnabled: getFocusedRouteNameFromRoute(route) !== "Content",
          swipeEdgeWidth: 100,
          drawerStyle: {
            width: 300,
          },
        };
      }}
      drawerContent={(props) => <DrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Nook"
        component={NookNavigator}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
}

const DrawerContent = (props: DrawerContentComponentProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const activeNookId = useAppSelector((state) => state.user.activeNook);
  const nooks = useAppSelector((state) => state.user.nooks);
  const nookId = activeNookId || nooks[0]?.nookId.toString();
  const activeNook = useAppSelector((state) => selectNookById(state, nookId));
  const activeShelves = useAppSelector((state) => state.user.activeShelves);
  const entity = useAppSelector((state) => state.user.entity);

  const dispatch = useAppDispatch();
  const activeShelf = activeShelves[nookId]
    ? activeNook?.shelves.find((shelf) => shelf.slug === activeShelves[nookId])
    : activeNook?.shelves[0];

  const userNook = nooks.find(
    ({ nookId }) => nookId === `entity:${entity?._id.toString()}`,
  );
  const otherNooks = nooks.filter(
    ({ nookId }) => nookId !== `entity:${entity?._id.toString()}`,
  );

  const viewingUnfollowedNook = !nooks.some(
    ({ nookId }) => nookId === activeNook?.nookId,
  );

  const DrawerItem = ({
    nook,
    viewingUnfollowedNook,
  }: { nook: Nook; viewingUnfollowedNook?: boolean }) => {
    return (
      <View
        key={nook.nookId}
        justifyContent="center"
        alignItems="center"
        borderRadius="$4"
        backgroundColor={
          nook.nookId === activeNook?.nookId && !viewingUnfollowedNook
            ? "$backgroundFocus"
            : undefined
        }
        borderWidth={viewingUnfollowedNook ? "$1.5" : undefined}
        borderColor={viewingUnfollowedNook ? "$backgroundFocus" : undefined}
        borderStyle="dashed"
        onPress={() => {
          const params = {
            nookId: nook.nookId,
            shelfId: activeShelves[nook.nookId] || nook.shelves[0]?.slug,
          };
          dispatch(setTheme(nook.theme));
          navigation.setParams(params);
          navigation.navigate("Nook", params);
          navigation.navigate("Shelf", params);
        }}
        style={{
          width: 48,
          height: 48,
        }}
      >
        <View borderRadius="$10" overflow="hidden">
          <Image
            source={nook.image}
            style={{
              width: 32,
              height: 32,
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <XStack theme="gray" height="100%" style={{ width: 300 }}>
      <YStack style={{ width: 60 }} backgroundColor="$background">
        <DrawerContentScrollView {...props}>
          <YStack gap="$1.5" alignItems="center">
            {userNook && <DrawerItem nook={userNook} />}
            <Separator
              borderWidth="$0.5"
              alignSelf="stretch"
              marginHorizontal="$2"
            />
            {otherNooks.map((nook) => (
              <DrawerItem nook={nook} key={nook.nookId} />
            ))}
            {viewingUnfollowedNook && activeNook && (
              <DrawerItem
                nook={activeNook}
                key={activeNook?.nookId}
                viewingUnfollowedNook
              />
            )}
          </YStack>
        </DrawerContentScrollView>
      </YStack>
      <YStack backgroundColor="$backgroundFocus" style={{ width: 240 }}>
        <DrawerContentScrollView {...props}>
          <YStack theme={activeNook?.theme} padding="$2">
            <YStack gap="$2">
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
              <Text padding="$1">{activeNook?.description}</Text>
              <Text
                color="$gray11"
                textTransform="uppercase"
                fontSize="$1"
                fontWeight="700"
                marginTop="$2"
                marginBottom="$2"
              >
                Shelves
              </Text>
            </YStack>
            {activeNook?.shelves.map((shelf) => (
              <View
                key={shelf.slug}
                padding="$2"
                backgroundColor={
                  activeShelf?.slug === shelf.slug ? "$gray7" : "$gray4"
                }
                borderRadius="$4"
                onPress={() => {
                  const params = {
                    nookId: activeNook.nookId,
                    shelfId: shelf.slug,
                  };
                  navigation.setParams(params);
                  navigation.navigate("Nook", params);
                  navigation.navigate("Shelf", params);
                }}
              >
                <Text
                  fontWeight={activeShelf?.slug === shelf.slug ? "700" : "500"}
                >
                  {shelf.name}
                </Text>
                <Text color="$gray11">{shelf.description}</Text>
              </View>
            ))}
          </YStack>
        </DrawerContentScrollView>
      </YStack>
    </XStack>
  );
};
