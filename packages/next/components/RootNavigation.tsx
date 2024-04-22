"use client";

import { NookButton, NookText, View, XStack, YStack } from "@nook/ui";
import {
  Bell,
  Home,
  MoreHorizontal,
  Sparkle,
  User,
} from "@tamagui/lucide-icons";
import { useAuth } from "@nook/app/context/auth";
import { useUser } from "@nook/app/api/farcaster";
import { FarcasterUserDisplay } from "@nook/app/components/farcaster/user-display";
import { CreateCastDialog } from "@nook/app/features/farcaster/create-cast/disalog";
import { AccountSwitcher } from "@nook/app/features/auth/account-switcher";
import Link from "next/link";

export const RootNavigation = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return (
    <XStack justifyContent="center" flex={1} backgroundColor="$color1">
      <View width={280} maxWidth={280} alignItems="flex-end">
        <View
          top={0}
          $platform-web={{
            position: "sticky",
          }}
          justifyContent="space-between"
          width="100%"
          paddingTop="$4"
          paddingBottom="$5"
          minHeight="100vh"
          paddingHorizontal="$3"
        >
          <YStack>
            <View paddingHorizontal="$3" marginBottom="$4">
              <NookText fontSize="$9" fontWeight="700">
                nook
              </NookText>
            </View>
            <RootNavigationItem label="Home" Icon={Home} href="/" />
            <RootNavigationItem
              label="Discover"
              Icon={Sparkle}
              href="/discover"
            />
            <RootNavigationItem
              label="Notifications"
              Icon={Bell}
              href="/notifications"
            />
            {user && (
              <RootNavigationItem
                label="Profile"
                Icon={User}
                href={`/${user?.username}`}
              />
            )}
            {user && (
              <View marginTop="$4">
                <CreateCastDialog />
              </View>
            )}
          </YStack>
          <SessionItem />
        </View>
      </View>
      <View width={1000} maxWidth={1000}>
        {children}
      </View>
    </XStack>
  );
};

const RootNavigationItem = ({
  label,
  Icon,
  href,
}: { label: string; Icon: typeof Home; href: string }) => {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <NookButton variant="ghost" borderRadius="$10">
        <XStack gap="$3" alignItems="center" paddingRight="$2">
          <Icon color="$mauve12" size={24} />
          <NookText fontWeight="500" fontSize="$7">
            {label}
          </NookText>
        </XStack>
      </NookButton>
    </Link>
  );
};

const SessionItem = () => {
  const { session, isLoading, login } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!session?.fid) {
    return (
      <NookButton variant="primary" onPress={login}>
        Sign in
      </NookButton>
    );
  }

  return <SessionUser fid={session.fid} />;
};

const SessionUser = ({ fid }: { fid: string }) => {
  const { data: user } = useUser(fid);

  if (!user) {
    return null;
  }

  return (
    <AccountSwitcher>
      <NookButton variant="ghost" height="$6" borderRadius="$10">
        <XStack justifyContent="space-between" alignItems="center" flexGrow={1}>
          <FarcasterUserDisplay user={user} />
          <MoreHorizontal color="$mauve12" size={16} />
        </XStack>
      </NookButton>
    </AccountSwitcher>
  );
};
