import { Button, Text, View, XStack, YStack } from "tamagui";
import { useAuth } from "@/context/auth";
import { Image } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { EntityAvatar } from "@/components/entity/avatar";
import { EntityDisplay } from "@/components/entity/display";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setTheme } from "@/store/slices/user";

export const ThemeSelector = () => {
  const dispatch = useAppDispatch();
  const themes = [
    "blue",
    "gray",
    "green",
    "orange",
    "pink",
    "purple",
    "red",
    "yellow",
  ];
  return (
    <YStack gap="$2">
      <Text
        color="$gray11"
        fontSize="$1"
        fontWeight="700"
        textTransform="uppercase"
      >
        SELECT THEME
      </Text>
      <XStack gap="$2">
        {themes.map((theme) => (
          <TouchableOpacity
            key={theme}
            onPress={() => dispatch(setTheme(theme))}
          >
            <View
              theme={theme}
              backgroundColor="$color5"
              width="$3"
              height="$3"
              borderRadius="$10"
              borderWidth="$1"
              borderColor="$color7"
            />
          </TouchableOpacity>
        ))}
      </XStack>
    </YStack>
  );
};

export default function ProfilePage() {
  const { signOut } = useAuth();
  const entity = useAppSelector((state) => state.user.entity);
  const insets = useSafeAreaInsets();
  const tabHeight = useBottomTabBarHeight();

  if (!entity) return null;

  return (
    <YStack
      flexGrow={1}
      backgroundColor="$background"
      minHeight="100%"
      justifyContent="flex-end"
      style={{
        paddingTop: insets.top,
        paddingBottom: tabHeight,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <View
        flexGrow={1}
        borderTopStartRadius="$6"
        borderTopEndRadius="$6"
        paddingHorizontal="$3"
        paddingVertical="$4"
        justifyContent="space-between"
      >
        <YStack gap="$4">
          <XStack gap="$2" alignItems="center">
            <EntityAvatar entityId={entity._id.toString()} size="$5" />
            <EntityDisplay
              entityId={entity._id.toString()}
              orientation="vertical"
            />
          </XStack>
          <ThemeSelector />
        </YStack>
        <YStack padding="$5" paddingVertical="$2" width="100%" gap="$2">
          <Button
            onPress={() => {
              signOut();
            }}
          >
            Sign Out
          </Button>
        </YStack>
      </View>
    </YStack>
  );
}
