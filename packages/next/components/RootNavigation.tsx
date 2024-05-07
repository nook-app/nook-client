"use client";

import { NookButton, NookText, View, XStack, YStack } from "@nook/ui";
import {
  ExternalLink,
  Home,
  LogIn,
  MoreHorizontal,
  Pencil,
  UserRoundPlus,
  Users2,
  Image as ImageIcon,
  MousePointerSquare,
  Search,
  Bell,
  User,
  Settings,
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
import { MobileNavigation } from "./MobileNavigation";
import { useTheme } from "@nook/app/context/theme";
import { EnableSignerDialog } from "@nook/app/features/farcaster/enable-signer/dialog";
import { NotificationsCount } from "@nook/app/features/notifications/notifications-count";
import { ReactNode } from "react";

export type NookNavigationItem = {
  label: string;
  Icon: typeof Home;
  href: string | ((userId: string) => string);
  right?: ReactNode;
  isExternal?: boolean;
  auth?: boolean;
};

export const NAVIGATION: NookNavigationItem[] = [
  {
    label: "Home",
    Icon: Home,
    href: "/",
  },
  {
    label: "Transactions",
    Icon: Users2,
    href: "/transactions",
    auth: true,
  },
  {
    label: "Media",
    Icon: ImageIcon,
    href: "/media",
  },
  {
    label: "Frames",
    Icon: MousePointerSquare,
    href: "/frames",
  },
  {
    label: "Explore",
    Icon: Search,
    href: "/explore",
  },
  {
    label: "Notifications",
    Icon: Bell,
    href: "/notifications",
    right: <NotificationsCount />,
    auth: true,
  },
  {
    label: "Profile",
    Icon: User,
    href: (userId) => `/users/${userId}`,
    auth: true,
  },
  {
    label: "Settings",
    Icon: Settings,
    href: "/settings",
    auth: true,
  },
];

export const RootNavigation = ({ children }: { children: React.ReactNode }) => {
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
        $xs={{ display: "none" }}
      >
        <View
          top={0}
          $platform-web={{
            position: "sticky",
          }}
          justifyContent="space-between"
          width="90%"
          minHeight="100vh"
          padding="$3"
          $lg={{ alignItems: "center" }}
        >
          <YStack $lg={{ alignItems: "center" }}>
            <View marginLeft="$3" marginBottom="$3" $lg={{ marginLeft: "$0" }}>
              <NookText fontSize="$9" fontWeight="700" $lg={{ fontSize: "$6" }}>
                nook
              </NookText>
            </View>
            <RootNavigationItems />
          </YStack>
          <SessionItem />
        </View>
      </View>

      <MobileNavigation>
        <View width={1000} maxWidth={1000} $md={{ width: "auto", flexGrow: 1 }}>
          {children}
        </View>
      </MobileNavigation>
    </XStack>
  );
};

const RootNavigationItems = () => {
  const { user } = useAuth();

  return (
    <>
      {NAVIGATION.map((props) => (
        <RootNavigationItem key={props.label} {...props} />
      ))}
      {user && <CreateCastItem />}
    </>
  );
};

const RootNavigationItem = ({
  label,
  Icon,
  href,
  right,
  isExternal,
  auth,
}: NookNavigationItem) => {
  const pathname = usePathname();
  const { user } = useAuth();

  if (auth && !user) {
    return null;
  }

  return (
    <View group $lg={{ width: "100%", alignItems: "center" }}>
      <Link
        href={
          typeof href === "string"
            ? href
            : user
              ? href(user.username || user.fid)
              : "#"
        }
        style={{ textDecoration: "none" }}
        target={isExternal ? "_blank" : undefined}
      >
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
          <XStack alignContent="center">
            <Icon
              color="$mauve12"
              size={24}
              strokeWidth={pathname === href ? 2.5 : 2}
            />
            <NookText>
              <NookText
                fontWeight={pathname === href ? "700" : "400"}
                fontSize="$7"
                marginLeft="$3"
                $lg={{ display: "none", marginLeft: "$0" }}
              >
                {label}
              </NookText>
              {isExternal && <ExternalLink size={16} marginLeft="$2" />}
            </NookText>
          </XStack>
          {right}
        </XStack>
      </Link>
    </View>
  );
};

const SessionItem = () => {
  const { login, user } = useAuth();
  const { theme } = useTheme();

  if (!user) {
    return (
      <YStack gap="$3">
        <View display="flex" $lg={{ display: "none" }}>
          <Link
            href="/signup"
            style={{ textDecoration: "none", width: "100%" }}
          >
            <NookButton
              variant="primary"
              backgroundColor="transparent"
              borderColor={
                ["light", "dark"].includes(theme) ? "$color12" : "$color9"
              }
              width="100%"
              borderWidth="$1"
            >
              <NookText
                fontWeight="700"
                fontSize="$5"
                color={
                  ["light", "dark"].includes(theme) ? "$color12" : "$color12"
                }
              >
                Create Account
              </NookText>
            </NookButton>
          </Link>
        </View>
        <View display="none" $lg={{ display: "flex" }}>
          <Link href="/signup">
            <NookButton
              variant="primary"
              width="$5"
              padding="$0"
              backgroundColor="transparent"
              borderColor={
                ["light", "dark"].includes(theme) ? "$color12" : "$color9"
              }
              borderWidth="$1"
            >
              <UserRoundPlus
                size={24}
                color={
                  ["light", "dark"].includes(theme) ? "$color1" : "$color12"
                }
              />
            </NookButton>
          </Link>
        </View>
        <View display="flex" $lg={{ display: "none" }}>
          <NookButton
            variant="primary"
            onPress={login}
            backgroundColor={
              ["light", "dark"].includes(theme) ? "$color12" : "$color9"
            }
          >
            <NookText
              fontWeight="700"
              fontSize="$5"
              color={["light", "dark"].includes(theme) ? "$color1" : "$color12"}
            >
              Sign In
            </NookText>
          </NookButton>
        </View>
        <View display="none" $lg={{ display: "flex" }}>
          <NookButton
            variant="primary"
            width="$5"
            padding="$0"
            onPress={login}
            backgroundColor={
              ["light", "dark"].includes(theme) ? "$color12" : "$color9"
            }
          >
            <LogIn
              size={24}
              color={["light", "dark"].includes(theme) ? "$color1" : "$color12"}
            />
          </NookButton>
        </View>
      </YStack>
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

const CreateCastItem = () => {
  const { signer } = useAuth();
  const { theme } = useTheme();

  if (signer?.state !== "completed") {
    return (
      <View marginTop="$4">
        <View display="flex" $lg={{ display: "none" }}>
          <EnableSignerDialog>
            <NookButton
              variant="primary"
              backgroundColor={
                theme && ["light", "dark"].includes(theme)
                  ? "$color12"
                  : "$color11"
              }
            >
              <NookText
                fontWeight="700"
                fontSize="$5"
                color={
                  theme && ["light", "dark"].includes(theme)
                    ? "$color1"
                    : "$color12"
                }
              >
                Enable Nook
              </NookText>
            </NookButton>
          </EnableSignerDialog>
        </View>
        <View display="none" $lg={{ display: "flex" }}>
          <EnableSignerDialog>
            <NookButton
              variant="primary"
              width="$5"
              padding="$0"
              backgroundColor={
                theme && ["light", "dark"].includes(theme)
                  ? "$color12"
                  : "$color11"
              }
            >
              <NookText>
                <Pencil
                  size={24}
                  color={
                    theme && ["light", "dark"].includes(theme)
                      ? "$color1"
                      : "$color12"
                  }
                />
              </NookText>
            </NookButton>
          </EnableSignerDialog>
        </View>
      </View>
    );
  }

  return (
    <View marginTop="$4">
      <CreateCastButton />
    </View>
  );
};
