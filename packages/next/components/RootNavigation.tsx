"use client";

import { NookButton, NookText, View, XStack, YStack, useTheme } from "@nook/ui";
import {
  Bell,
  Home,
  LogIn,
  MoreHorizontal,
  Search,
  Settings,
  User,
} from "@tamagui/lucide-icons";
import { useAuth } from "@nook/app/context/auth";
import {
  FarcasterUserAvatar,
  FarcasterUserDisplay,
} from "@nook/app/components/farcaster/users/user-display";
import { CreateCastButton } from "@nook/app/features/farcaster/create-cast/disalog";
import { AccountSwitcher } from "@nook/app/features/auth/account-switcher";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationsCount } from "@nook/app/features/notifications/notifications-count";
import { FarcasterUser } from "@nook/app/types";
import { MobileNavigation } from "./MobileNavigation";

export const RootNavigation = ({
  children,
  user,
}: { children: React.ReactNode; user?: FarcasterUser }) => {
  return (
    <XStack
      justifyContent="center"
      flex={1}
      backgroundColor="$color1"
      $lg={{ justifyContent: "flex-start" }}
    >
      <View
        width={280}
        maxWidth={280}
        alignItems="flex-end"
        $lg={{ width: "auto" }}
        $xxs={{ display: "none" }}
      >
        <View
          top={0}
          $platform-web={{
            position: "sticky",
          }}
          justifyContent="space-between"
          width="100%"
          minHeight="100vh"
          padding="$3"
          $lg={{ alignItems: "center" }}
        >
          <YStack $lg={{ alignItems: "center" }}>
            <View
              paddingHorizontal="$3"
              height="$4.5"
              $lg={{ justifyContent: "center" }}
            >
              <NookText fontSize="$9" fontWeight="700" $lg={{ fontSize: "$5" }}>
                nook
              </NookText>
            </View>
            <RootNavigationItem label="Home" Icon={Home} href="/" />
            <RootNavigationItem label="Explore" Icon={Search} href="/explore" />
            {user && (
              <>
                <RootNavigationItem
                  label="Notifications"
                  Icon={Bell}
                  href="/notifications"
                  right={<NotificationsCount />}
                />
                <RootNavigationItem
                  label="Profile"
                  Icon={User}
                  href={`/users/${user?.username}`}
                />
                <RootNavigationItem
                  label="Settings"
                  Icon={Settings}
                  href="/settings"
                />
                <View marginTop="$4">
                  <CreateCastButton />
                </View>
              </>
            )}
          </YStack>
          <SessionItem user={user} />
        </View>
      </View>

      <MobileNavigation user={user}>
        <View width={1000} maxWidth={1000} $lg={{ width: "auto", flexGrow: 1 }}>
          {children}
        </View>
      </MobileNavigation>
    </XStack>
  );
};

const RootNavigationItem = ({
  label,
  Icon,
  href,
  right,
}: {
  label: string;
  Icon: typeof Home;
  href: string;
  right?: React.ReactNode;
}) => {
  const pathname = usePathname();
  return (
    <View group $lg={{ width: "100%", alignItems: "center" }}>
      <Link href={href} style={{ textDecoration: "none" }}>
        {/* @ts-ignore */}
        <XStack
          justifyContent="space-between"
          alignItems="center"
          paddingRight="$2"
          borderRadius="$10"
          backgroundColor="transparent"
          padding="$3.5"
          $group-hover={{
            backgroundColor: "$color3",
            transition: "all 0.2s ease-in-out",
          }}
        >
          <XStack gap="$3" alignContent="center">
            <Icon
              color="$mauve12"
              size={24}
              strokeWidth={pathname === href ? 2.5 : 2}
            />
            <NookText
              fontWeight={pathname === href ? "700" : "400"}
              fontSize="$7"
              $lg={{ display: "none" }}
            >
              {label}
            </NookText>
          </XStack>
          {right}
        </XStack>
      </Link>
    </View>
  );
};

const SessionItem = ({ user }: { user?: FarcasterUser }) => {
  const { login } = useAuth();

  if (!user?.fid) {
    return (
      <>
        <View display="flex" $lg={{ display: "none" }}>
          <NookButton variant="primary" onPress={login}>
            <NookText fontWeight="700" fontSize="$5">
              Sign In
            </NookText>
          </NookButton>
        </View>
        <View display="none" $lg={{ display: "flex" }}>
          <NookButton variant="primary" width="$5" padding="$0" onPress={login}>
            <NookText>
              <LogIn size={24} />
            </NookText>
          </NookButton>
        </View>
      </>
    );
  }

  return (
    <>
      <View display="flex" $lg={{ display: "none" }}>
        <AccountSwitcher>
          <NookButton variant="ghost" height="$6" borderRadius="$10">
            <XStack
              justifyContent="space-between"
              alignItems="center"
              flexGrow={1}
              $lg={{ display: "none" }}
            >
              <FarcasterUserDisplay user={user} />
              <MoreHorizontal color="$mauve12" size={16} />
            </XStack>
          </NookButton>
        </AccountSwitcher>
      </View>
      <View display="none" $lg={{ display: "flex" }}>
        <AccountSwitcher>
          <NookButton
            variant="ghost"
            height="$6"
            borderRadius="$10"
            width="$6"
            padding="$0"
            justifyContent="center"
            alignItems="center"
          >
            <FarcasterUserAvatar user={user} size="$4" />
          </NookButton>
        </AccountSwitcher>
      </View>
    </>
  );
};
