"use client";

import { FarcasterUserAvatar } from "@nook/app/components/farcaster/users/user-display";
import { useAuth } from "@nook/app/context/auth";
import { useTheme } from "@nook/app/context/theme";
import { AccountSwitcher } from "@nook/app/features/auth/account-switcher";
import { CreateCastDialog } from "@nook/app/features/farcaster/create-cast/disalog";
import { EnableSignerDialog } from "@nook/app/features/farcaster/enable-signer/dialog";
import {
  NookButton,
  NookText,
  Popover,
  View,
  XStack,
  YStack,
} from "@nook/app-ui";
import { Bell, Home, LogIn, Menu, Pencil, Search } from "@tamagui/lucide-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { NAVIGATION, NookNavigationItem } from "./RootNavigation";

export const MobileNavigation = ({ children }: { children: ReactNode }) => {
  return (
    <View $md={{ flex: 1 }}>
      <View $md={{ flex: 1 }}>{children}</View>
      <MobileTabMenu />
      <MobileCreateButton />
    </View>
  );
};

const MobileTabMenu = () => {
  return (
    <YStack
      backgroundColor="$color2"
      borderTopWidth="$0.5"
      borderTopColor="$borderColorBg"
      justifyContent="space-around"
      alignItems="center"
      flexDirection="row"
      left={0}
      right={0}
      bottom={0}
      zIndex={1000}
      paddingBottom="$3"
      display="none"
      $xs={{ display: "flex" }}
      $platform-web={{
        position: "fixed",
      }}
    >
      <Link href="/" style={{ flexGrow: 1 }}>
        <NookButton
          padding="$0"
          borderRadius="$0"
          height="$5"
          width="100%"
          backgroundColor="transparent"
          borderWidth="$0"
          scaleIcon={1.9}
          icon={<Home />}
        />
      </Link>
      <Link href="/explore" style={{ flexGrow: 1 }}>
        <NookButton
          padding="$0"
          borderRadius="$0"
          height="$5"
          width="100%"
          backgroundColor="transparent"
          borderWidth="$0"
          scaleIcon={1.9}
          icon={<Search />}
        />
      </Link>
      <MobileNavigationAuth />
    </YStack>
  );
};

const MobileNavigationAuth = () => {
  const { user, login } = useAuth();

  if (!user)
    return (
      <NookButton
        variant="ghost"
        flexGrow={1}
        height="$5"
        padding="$0"
        justifyContent="center"
        alignItems="center"
        onPress={login}
      >
        <LogIn size={26.5} />
      </NookButton>
    );

  return (
    <>
      <Link href="/notifications" style={{ flexGrow: 1 }}>
        <NookButton
          padding="$0"
          width="100%"
          borderRadius="$0"
          height="$5"
          backgroundColor="transparent"
          borderWidth="$0"
          scaleIcon={1.9}
          icon={<Bell />}
        />
      </Link>
      <AccountSwitcher>
        <NookButton
          variant="ghost"
          flexGrow={1}
          height="$5"
          padding="$0"
          justifyContent="center"
          alignItems="center"
        >
          <FarcasterUserAvatar user={user} size="$3" />
        </NookButton>
      </AccountSwitcher>
    </>
  );
};

const MobileCreateButton = () => {
  const { signer } = useAuth();
  const { theme } = useTheme();

  if (!signer) return null;

  if (signer.state !== "completed") {
    return (
      <View display="none" $xs={{ display: "flex" }}>
        <EnableSignerDialog>
          <NookButton
            variant="primary"
            zIndex={1000}
            width="$5"
            height="$5"
            padding="$1"
            right={15}
            bottom={65}
            $platform-web={{
              position: "fixed",
            }}
            borderWidth="$0"
            backgroundColor={
              ["light", "dark"].includes(theme) ? "$color12" : "$color9"
            }
            pressStyle={{
              backgroundColor: ["light", "dark"].includes(theme)
                ? "$color11"
                : "$color10",
            }}
          >
            <Pencil
              color={["light", "dark"].includes(theme) ? "$color1" : "white"}
            />
          </NookButton>
        </EnableSignerDialog>
      </View>
    );
  }

  return (
    <View display="none" $xs={{ display: "flex" }}>
      <CreateCastDialog initialState={{ text: "" }}>
        <NookButton
          variant="primary"
          zIndex={1000}
          width="$5"
          height="$5"
          padding="$1"
          right={15}
          bottom={65}
          $platform-web={{
            position: "fixed",
          }}
          borderWidth="$0"
          backgroundColor={
            ["light", "dark"].includes(theme) ? "$color12" : "$color9"
          }
          pressStyle={{
            backgroundColor: ["light", "dark"].includes(theme)
              ? "$color11"
              : "$color10",
          }}
        >
          <Pencil
            color={["light", "dark"].includes(theme) ? "$color1" : "white"}
          />
        </NookButton>
      </CreateCastDialog>
    </View>
  );
};

export const MobileNavigationHeader = () => {
  return (
    <XStack
      height="$5"
      paddingHorizontal="$3"
      justifyContent="space-between"
      alignItems="center"
      display="none"
      $xs={{ display: "flex" }}
    >
      <XStack gap="$5" alignItems="center">
        <MobileNavigationMenu />
        <NookText variant="label">nook</NookText>
      </XStack>
    </XStack>
  );
};

const MobileNavigationMenu = () => {
  return (
    <Popover placement="bottom" size="$5" allowFlip>
      <Popover.Trigger asChild>
        <NookButton
          icon={<Menu />}
          circular
          size="$3"
          scaleIcon={1.5}
          backgroundColor="transparent"
          borderWidth="$0"
          hoverStyle={{
            // @ts-ignore
            transition: "all 0.2s ease-in-out",
            backgroundColor: "$color3",
          }}
        />
      </Popover.Trigger>
      <Popover.Content
        borderWidth={1}
        borderColor="$borderColorBg"
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          "100ms",
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
        paddingHorizontal="$0"
        paddingVertical="$2"
        width={300}
      >
        <Popover.Arrow borderWidth={1} borderColor="$borderColorBg" />
        {NAVIGATION.map((props) => (
          <MobileNavigationMenuItem key={props.label} {...props} />
        ))}
      </Popover.Content>
    </Popover>
  );
};

const MobileNavigationMenuItem = ({
  label,
  Icon,
  href,
  right,
  auth,
  isExternal,
}: NookNavigationItem) => {
  const pathname = usePathname();
  const { user } = useAuth();

  if (auth && !user) {
    return null;
  }

  return (
    <View group width="100%">
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
          backgroundColor="transparent"
          padding="$2.5"
          $group-hover={{
            backgroundColor: "$color3",
            transition: "all 0.2s ease-in-out",
          }}
        >
          <XStack gap="$3" alignContent="center">
            <Icon
              color="$mauve12"
              size={16}
              strokeWidth={pathname === href ? 2.5 : 2}
            />
            <NookText
              fontWeight={pathname === href ? "700" : "400"}
              fontSize="$5"
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
