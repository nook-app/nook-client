import { useAuth } from "@nook/app/context/auth";
import { useNavigation } from "expo-router";
import { PlatformPressable } from "@react-navigation/elements";
import { DrawerActions } from "@react-navigation/native";
import { Image } from "@nook/app-ui";
import { formatToCDN } from "@nook/app/utils";

export const DrawerToggleButton = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  return (
    <PlatformPressable
      accessible
      accessibilityRole="button"
      android_ripple={{ borderless: true }}
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Image
        source={{
          uri: user?.pfp ? formatToCDN(user.pfp, { width: 168 }) : undefined,
        }}
        fadeDuration={0}
        width="$2.5"
        height="$2.5"
        borderRadius="$10"
      />
    </PlatformPressable>
  );
};
