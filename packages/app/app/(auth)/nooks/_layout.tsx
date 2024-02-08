import { Drawer } from "expo-router/drawer";
import { Image, Text, View, XStack, YStack } from "tamagui";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Nook, TEMPLATE_NOOKS } from "@constants/nooks";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useAppSelector } from "@hooks/useAppSelector";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { setActiveNook } from "@store/user";
import { router, usePathname } from "expo-router";

const DrawerNookItem = ({
  nook,
  handlePress,
}: { nook: Nook; handlePress: (nook: Nook) => void }) => {
  const activeNook = useAppSelector((state) => state.user.activeNook);
  const component = (
    <View
      backgroundColor={
        activeNook.id === nook.id ? "$backgroundFocus" : undefined
      }
      borderWidth={activeNook.id === nook.id ? "$1" : "$0"}
      borderColor={activeNook.id === nook.id ? "$borderColor" : undefined}
      borderRadius="$4"
      width="$5"
      height="$5"
      justifyContent="center"
      alignItems="center"
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

const DrawerNookOverview = () => {
  const activeNook = useAppSelector((state) => state.user.activeNook);

  return (
    <View flexGrow={1} backgroundColor="$background" theme="gray">
      <DrawerContentScrollView>
        <YStack gap="$2" padding="$2" theme={activeNook.theme}>
          <View
            padding="$2"
            justifyContent="center"
            alignItems="center"
            borderColor="$borderColor"
            borderBottomWidth="$1"
            borderRadius="$4"
            backgroundColor="$backgroundStrong"
          >
            <Text letterSpacing={1}>{activeNook.name}</Text>
          </View>
        </YStack>
      </DrawerContentScrollView>
    </View>
  );
};

export default function DrawerLayout() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();

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
      screenOptions={{
        headerShown: false,
        swipeEdgeWidth: 100,
        swipeEnabled: !pathname.includes("content"),
      }}
      drawerContent={() => (
        // <View flexGrow={1} backgroundColor="$backgroundStrong" theme="gray">
        //   <DrawerContentScrollView>
        //     <XStack>
        //       <YStack gap="$2" padding="$2">
        //         {TEMPLATE_NOOKS.map((nook) => (
        //           <DrawerNookItem
        //             key={nook.id}
        //             nook={nook}
        //             active={activeNook.id === nook.id}
        //             handlePress={() => handleNookNavigate(nook)}
        //           />
        //         ))}
        //       </YStack>
        //       <YStack backgroundColor="$background">
        //         <Text>Settings</Text>
        //       </YStack>
        //     </XStack>
        //   </DrawerContentScrollView>
        // </View>
        <XStack flexGrow={1} theme="gray">
          <View backgroundColor="$color2" width="$6">
            <DrawerContentScrollView>
              <YStack gap="$2" padding="$2" alignItems="center">
                {TEMPLATE_NOOKS.map((nook) => (
                  <DrawerNookItem
                    key={nook.id}
                    nook={nook}
                    handlePress={() => handleNookNavigate(nook)}
                  />
                ))}
              </YStack>
            </DrawerContentScrollView>
          </View>
          <DrawerNookOverview />
        </XStack>
      )}
    />
  );
}
