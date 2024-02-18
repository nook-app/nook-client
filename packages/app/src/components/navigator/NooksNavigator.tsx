import {
  DrawerContentScrollView,
  createDrawerNavigator,
} from "@react-navigation/drawer";
import {
  useNavigation,
  NavigationProp,
  CommonActions,
  getFocusedRouteNameFromRoute,
} from "@react-navigation/native";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { Text, View, XStack, YStack } from "tamagui";
import { Image } from "expo-image";
import { RootStackParamList } from "@/types";
import { setActiveNook, setActiveShelf } from "@/store/user";
import { useAppSelector } from "@/hooks/useAppSelector";
import { NookNavigator } from "./NookNavigator";

const Drawer = createDrawerNavigator();

export function NooksNavigator() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const nooks = useAppSelector((state) => state.user.nooks);
  const activeNook = useAppSelector((state) => state.user.activeNook);
  const activeShelves = useAppSelector((state) => state.user.activeShelves);
  const activeShelf = activeNook
    ? activeShelves[activeNook.id] || activeNook.shelves[0]
    : undefined;

  return (
    <Drawer.Navigator
      screenOptions={({ route }) => {
        return {
          swipeEnabled: getFocusedRouteNameFromRoute(route) !== "Content",
          swipeEdgeWidth: 100,
        };
      }}
      drawerContent={(props) => (
        <XStack theme="gray" height="100%">
          <YStack>
            <DrawerContentScrollView {...props}>
              <YStack gap="$2" padding="$2">
                {nooks.map((nook) => (
                  <View
                    key={nook.id}
                    padding="$2"
                    justifyContent="center"
                    alignItems="center"
                    borderRadius="$4"
                    backgroundColor={
                      nook.id === activeNook?.id
                        ? "$backgroundFocus"
                        : undefined
                    }
                    onPress={() => {
                      dispatch(setActiveNook(nook.id));
                      navigation.dispatch(
                        CommonActions.reset({
                          index: 0,
                          routes: [
                            {
                              name: "Nook",
                              params: {
                                nookId: nook.id,
                                shelfId:
                                  activeShelves[nook.id]?.id ||
                                  nook.shelves[0].id,
                              },
                            },
                          ],
                        }),
                      );
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
                ))}
              </YStack>
            </DrawerContentScrollView>
          </YStack>
          <YStack
            backgroundColor="$backgroundFocus"
            flexGrow={1}
            maxWidth="$16"
          >
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
                    marginBottom="$1"
                  >
                    Shelves
                  </Text>
                </YStack>
                {activeNook?.shelves.map((shelf) => (
                  <View
                    key={shelf.id}
                    padding="$2"
                    backgroundColor={
                      activeShelf?.id === shelf.id ? "$color5" : "$gray4"
                    }
                    borderRadius="$4"
                    onPress={() => {
                      dispatch(setActiveShelf(shelf.id));
                      navigation.navigate("Shelf", {
                        nookId: activeNook.id,
                        shelfId: shelf.id,
                      });
                    }}
                  >
                    <Text
                      fontWeight={activeShelf?.id === shelf.id ? "700" : "500"}
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
      )}
    >
      <Drawer.Screen
        name="Nook"
        component={NookNavigator}
        initialParams={{
          nookId: activeNook?.id,
          shelfId: activeShelf?.id,
        }}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
}
