import { useAuth } from "@nook/app/context/auth";
import { useNavigation } from "expo-router";
import { PlatformPressable } from "@react-navigation/elements";
import { DrawerActions } from "@react-navigation/native";
import { Platform } from "react-native";
import { Image } from "@nook/app-ui";

export const DrawerToggleButton = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  return (
    <PlatformPressable
      accessible
      accessibilityRole="button"
      android_ripple={{ borderless: true }}
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      hitSlop={Platform.select({
        ios: undefined,
        default: { top: 16, right: 16, bottom: 16, left: 16 },
      })}
    >
      <Image
        source={{ uri: user?.pfp }}
        fadeDuration={0}
        width={32}
        height={32}
        borderRadius="$10"
      />
    </PlatformPressable>
  );
};
