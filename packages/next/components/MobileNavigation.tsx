"use client";

import { FarcasterUserAvatar } from "@nook/app/components/farcaster/users/user-display";
import { useAuth } from "@nook/app/context/auth";
import { AccountSwitcher } from "@nook/app/features/auth/account-switcher";
import { CreateCastDialog } from "@nook/app/features/farcaster/create-cast/disalog";
import { FarcasterUser } from "@nook/app/types";
import { NookButton, View, YStack } from "@nook/ui";
import {
  Bell,
  Home,
  LogIn,
  Pencil,
  Search,
  Settings,
} from "@tamagui/lucide-icons";
import { ReactNode } from "react";
import { useRouter } from "solito/navigation";

export const MobileNavigation = ({
  user,
  children,
}: { user?: FarcasterUser; children: ReactNode }) => {
  return (
    <View flex={1}>
      <View flex={1}>{children}</View>
      <MobileTabMenu user={user} />
      <MobileCreateButton />
    </View>
  );
};

const MobileTabMenu = ({ user }: { user?: FarcasterUser }) => {
  const router = useRouter();
  return (
    <YStack
      backgroundColor="$color2"
      borderTopWidth="$0.5"
      borderTopColor="rgba(256, 256, 256, 0.1)"
      justifyContent="space-around"
      alignItems="center"
      flexDirection="row"
      left={0}
      right={0}
      bottom={0}
      zIndex={1000}
      display="none"
      $xxs={{ display: "flex" }}
      $platform-web={{
        position: "fixed",
      }}
    >
      <NookButton
        padding="$0"
        borderRadius="$0"
        height="$5"
        flexGrow={1}
        backgroundColor="transparent"
        borderWidth="$0"
        scaleIcon={1.5}
        onPress={() => router.push("/")}
        icon={<Home />}
      />
      <NookButton
        padding="$0"
        borderRadius="$0"
        height="$5"
        flexGrow={1}
        backgroundColor="transparent"
        borderWidth="$0"
        scaleIcon={1.5}
        onPress={() => router.push("/explore")}
        icon={<Search />}
      />
      {user && (
        <>
          <NookButton
            padding="$0"
            flexGrow={1}
            borderRadius="$0"
            height="$5"
            backgroundColor="transparent"
            borderWidth="$0"
            scaleIcon={1.5}
            onPress={() => router.push("/notifications")}
            icon={<Bell />}
          />
          <NookButton
            padding="$0"
            flexGrow={1}
            borderRadius="$0"
            height="$5"
            backgroundColor="transparent"
            borderWidth="$0"
            scaleIcon={1.5}
            onPress={() => router.push("/settings")}
            icon={<Settings />}
          />

          <MobileNavigationAuth user={user} />
        </>
      )}
    </YStack>
  );
};

const MobileNavigationAuth = ({ user }: { user?: FarcasterUser }) => {
  const { login } = useAuth();

  if (!user?.fid) {
    return (
      <NookButton
        variant="primary"
        flexGrow={1}
        padding="$0"
        height="$5"
        justifyContent="center"
        alignItems="center"
        onPress={login}
      >
        <LogIn size={16} />
      </NookButton>
    );
  }

  return (
    <AccountSwitcher>
      <NookButton
        variant="ghost"
        flexGrow={1}
        height="$5"
        padding="$0"
        justifyContent="center"
        alignItems="center"
      >
        <FarcasterUserAvatar user={user} size="$2" />
      </NookButton>
    </AccountSwitcher>
  );
};

const MobileCreateButton = () => {
  return (
    <CreateCastDialog initialState={{ text: "" }}>
      <NookButton
        variant="primary"
        zIndex={1000}
        width="$5"
        height="$5"
        padding="$1"
        right={20}
        bottom={80}
        $platform-web={{
          position: "fixed",
        }}
      >
        <Pencil />
      </NookButton>
    </CreateCastDialog>
  );
};
