import { NookText, View, XStack, YStack } from "@nook/app-ui";
import { FarcasterPowerBadge } from "@nook/app/components/farcaster/users/power-badge";
import { FarcasterUserAvatar } from "@nook/app/components/farcaster/users/user-display";
import { useAuth } from "@nook/app/context/auth";
import { formatNumber } from "@nook/app/utils";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { ComponentType } from "react";
import {
  Home,
  User,
  Settings,
  Image,
  MousePointerSquare,
} from "@tamagui/lucide-icons";
import { Href } from "expo-router/build/link/href";
import { Link } from "@nook/app/components/link";

export const SidebarLayout = () => {
  return (
    <View flexGrow={1} backgroundColor="$color1">
      <DrawerContentScrollView>
        <View paddingHorizontal="$6" paddingVertical="$2">
          <SidebarUser />
          <SidebarNavigation />
        </View>
      </DrawerContentScrollView>
    </View>
  );
};

const SidebarUser = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <YStack>
      <XStack justifyContent="space-between" alignItems="center" gap="$2">
        <FarcasterUserAvatar size="$4" user={user} />
      </XStack>
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
      <XStack gap="$2" marginTop="$3">
        <Link
          href={`/(drawer)/(tabs)/(home)/users/${user.username}/following`}
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
        <Link
          href={`/(drawer)/(tabs)/(home)/users/${user.username}/followers`}
          absolute
        >
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
    <YStack marginVertical="$6" gap="$5">
      <SidebarNavigationItem
        label="Home"
        Icon={Home}
        href={{
          pathname: "/(drawer)/(tabs)/(home)",
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
        label="Profile"
        Icon={User}
        href={{
          pathname: "/(drawer)/(tabs)/(home)/users/[username]",
          params: { username: user?.username },
        }}
      />
      <SidebarNavigationItem
        label="Settings"
        Icon={Settings}
        href={{
          pathname: "/(drawer)/(tabs)/(home)/settings",
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
      >
        <Icon color="$mauve12" size={24} />
        <NookText>
          <NookText fontSize="$7" fontWeight="600">
            {label}
          </NookText>
        </NookText>
      </XStack>
    </Link>
  );
};
