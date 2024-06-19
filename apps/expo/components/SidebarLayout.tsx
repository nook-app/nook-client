import { NookText, View, XStack, YStack } from "@nook/app-ui";
import { FarcasterPowerBadge } from "@nook/app/components/farcaster/users/power-badge";
import { FarcasterUserAvatar } from "@nook/app/components/farcaster/users/user-display";
import { useAuth } from "@nook/app/context/auth";
import { formatNumber } from "@nook/app/utils";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { ComponentType, memo, useEffect, useState } from "react";
import {
  Home,
  User,
  Settings,
  Image,
  MousePointerSquare,
  UsersRound,
  MenuSquare,
  ArrowUp,
} from "@tamagui/lucide-icons";
import { Href } from "expo-router/build/link/href";
import { Link } from "@nook/app/components/link";
import { AccountSwitcher } from "@nook/app/features/auth/account-switcher";
import { IconButton } from "./IconButton";
import * as Updates from "expo-updates";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const SidebarLayout = memo(() => {
  return (
    <View flexGrow={1} backgroundColor="$color1">
      <DrawerContentScrollView>
        <View paddingHorizontal="$6" paddingVertical="$2">
          <SidebarUser />
          <SidebarNavigation />
        </View>
      </DrawerContentScrollView>
      <SidebarUpdate />
    </View>
  );
});

const SidebarUser = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <YStack>
      <XStack justifyContent="space-between" alignItems="center" gap="$2">
        <Link
          href={{
            pathname: "/users/[username]",
            params: { username: user.username },
          }}
        >
          <FarcasterUserAvatar size="$4" user={user} />
        </Link>
        <AccountSwitcher>
          <IconButton icon={UsersRound} />
        </AccountSwitcher>
      </XStack>
      <Link
        href={{
          pathname: "/users/[username]",
          params: { username: user.username },
        }}
      >
        <YStack gap="$1.5" marginTop="$2">
          <XStack gap="$1.5" alignItems="center">
            <NookText fontSize="$5" fontWeight="700">
              {user.displayName || user.username || `!${user.fid}`}
            </NookText>
            <FarcasterPowerBadge badge={user.badges?.powerBadge ?? false} />
          </XStack>
          <NookText muted>
            {user.username ? `@${user.username}` : `!${user.fid}`}
          </NookText>
        </YStack>
      </Link>
      <XStack gap="$2" marginTop="$3">
        <Link
          href={`/(drawer)/(tabs)/(a)/users/${user.username}/following`}
          absolute
        >
          <View flexDirection="row" alignItems="center" gap="$1">
            <NookText fontWeight="600" fontSize="$4">
              {formatNumber(user.engagement?.following || 0)}
            </NookText>
            <NookText muted fontSize="$4">
              following
            </NookText>
          </View>
        </Link>
        <Link href={`/users/${user.username}/followers`}>
          <View flexDirection="row" alignItems="center" gap="$1">
            <NookText fontWeight="600" fontSize="$4">
              {formatNumber(user.engagement?.followers || 0)}
            </NookText>
            <NookText muted fontSize="$4">
              followers
            </NookText>
          </View>
        </Link>
      </XStack>
    </YStack>
  );
};

const SidebarNavigation = () => {
  const { user } = useAuth();
  return (
    <YStack marginVertical="$5">
      <SidebarNavigationItem
        label="Home"
        Icon={Home}
        href={{
          pathname: "/(drawer)/(tabs)/(a)",
        }}
      />
      <SidebarNavigationItem
        label="Media"
        Icon={Image}
        href={{
          pathname: "/(drawer)/(tabs)/(media)/media",
        }}
      />
      <SidebarNavigationItem
        label="Frames"
        Icon={MousePointerSquare}
        href={{
          pathname: "/(drawer)/(tabs)/(frames)/frames",
        }}
      />
      <SidebarNavigationItem
        label="Lists"
        Icon={MenuSquare}
        href={{
          pathname: "/(drawer)/(tabs)/(a)/lists",
        }}
      />
      <SidebarNavigationItem
        label="Profile"
        Icon={User}
        href={{
          pathname: "/(drawer)/(tabs)/(a)/users/[username]",
          params: { username: user?.username },
        }}
      />
      <SidebarNavigationItem
        label="Settings"
        Icon={Settings}
        href={{
          pathname: "/(drawer)/(tabs)/(a)/settings",
        }}
      />
    </YStack>
  );
};

const SidebarNavigationItem = ({
  label,
  Icon,
  href,
}: {
  label: string;
  Icon: ComponentType<{ color: string; size: number }>;
  href: Href;
}) => {
  return (
    <Link href={href} absolute>
      <XStack
        borderRadius="$10"
        backgroundColor="transparent"
        alignItems="center"
        gap="$4"
        paddingVertical="$3"
      >
        <Icon color="$mauve12" size={24} />
        <NookText fontSize="$7" fontWeight="700">
          {label}
        </NookText>
      </XStack>
    </Link>
  );
};

const SidebarUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (__DEV__) return;
    async function checkForUpdate() {
      const update = await Updates.checkForUpdateAsync();
      setUpdateAvailable(update.isAvailable);
    }

    checkForUpdate();
    const interval = setInterval(checkForUpdate, 300000);

    return () => clearInterval(interval);
  }, []);

  if (!updateAvailable) return null;

  const handleUpdate = async () => {
    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync();
  };

  return (
    <View
      style={{ position: "absolute", bottom: insets.bottom, right: 0, left: 0 }}
    >
      <TouchableOpacity onPress={handleUpdate}>
        <XStack
          borderRadius="$10"
          backgroundColor="transparent"
          alignItems="center"
          gap="$4"
          paddingVertical="$3"
          paddingHorizontal="$6"
        >
          <ArrowUp color="$mauve12" size={24} />
          <NookText fontSize="$7" fontWeight="700">
            Update App
          </NookText>
        </XStack>
      </TouchableOpacity>
    </View>
  );
};
