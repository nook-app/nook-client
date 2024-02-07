import { Drawer } from "expo-router/drawer";
import { Image, View, YStack } from "tamagui";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Nook, TEMPLATE_NOOKS } from "@constants/nooks";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useAppSelector } from "@hooks/useAppSelector";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { setActiveNook } from "@store/user";
import { router } from "expo-router";

const DrawerNookItem = ({
  nook,
  active,
  handlePress,
}: { nook: Nook; active: boolean; handlePress: (nook: Nook) => void }) => {
  const component = (
    <View
      backgroundColor={active ? "$backgroundFocus" : undefined}
      borderWidth={active ? "$1" : "$0"}
      borderColor={active ? "$borderColor" : undefined}
      borderRadius="$4"
      width="$5"
      height="$5"
      justifyContent="center"
      alignItems="center"
      theme={nook.theme}
    >
      <View width="$3" height="$3" borderRadius="$10" overflow="hidden">
        <Image source={{ uri: nook.image }} width="100%" height="100%" />
      </View>
    </View>
  );

  return (
    <TouchableOpacity onPress={() => handlePress(nook)}>
      {component}
    </TouchableOpacity>
  );
};

export default function DrawerLayout() {
  const dispatch = useAppDispatch();
  const activeNook = useAppSelector((state) => state.user.activeNook);

  const handleNookNavigate = (nook: Nook) => {
    dispatch(setActiveNook(nook));
    router.replace({
      pathname: "/(auth)/nooks/[nookId]/",
      params: {
        nookId: nook.id,
      },
    });
  };

  return (
    <Drawer
      screenOptions={{ headerShown: false, swipeEdgeWidth: 500 }}
      drawerContent={() => (
        <View flexGrow={1} backgroundColor="$background" theme="pink">
          <DrawerContentScrollView>
            <YStack gap="$2" padding="$2">
              {TEMPLATE_NOOKS.map((nook) => (
                <DrawerNookItem
                  key={nook.id}
                  nook={nook}
                  active={activeNook.id === nook.id}
                  handlePress={() => handleNookNavigate(nook)}
                />
              ))}
            </YStack>
          </DrawerContentScrollView>
        </View>
      )}
    />
  );
}
