import {
  NookButton,
  Popover,
  Separator,
  Spinner,
  View,
  XStack,
  YStack,
} from "@nook/app-ui";
import { ReactNode, useCallback, useState } from "react";
import { useAuth } from "../../context/auth";
import { Session } from "@nook/common/types";
import { useUsers } from "../../api/farcaster";
import { FarcasterUserDisplay } from "../../components/farcaster/users/user-display";
import { Check } from "@tamagui/lucide-icons";
import { useRouter } from "next/navigation";
import { getSessions } from "../../utils/local-storage";
import { Link } from "solito/link";

export const AccountSwitcher = ({ children }: { children: ReactNode }) => {
  return (
    <Popover placement="top" size="$5" allowFlip>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
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
      >
        <Popover.Arrow borderWidth={1} borderColor="$borderColorBg" />
        <AccountSwitcherContent />
      </Popover.Content>
    </Popover>
  );
};

const AccountSwitcherContent = () => {
  const { login, logout, user } = useAuth();
  const router = useRouter();

  const sessions = getSessions();

  return (
    <YStack width="$19">
      {sessions.length > 0 && (
        <>
          <AccountSwitcherSessions sessions={sessions} />
          <Separator marginVertical="$2" />
        </>
      )}
      <NookButton variant="ghost" height="$4" onPress={login}>
        Add an existing account
      </NookButton>
      <Link href="/signup">
        <NookButton variant="ghost" height="$4">
          Create a new account
        </NookButton>
      </Link>
      {user && (
        <>
          <NookButton
            variant="ghost"
            height="$4"
            onPress={() => router.push(`/users/${user.username || user.fid}`)}
          >{`View ${
            user.username ? `@${user.username}` : `!${user.fid}`
          }`}</NookButton>
          <NookButton variant="ghost" height="$4" onPress={logout}>{`Log out ${
            user.username ? `@${user.username}` : `!${user.fid}`
          }`}</NookButton>
        </>
      )}
    </YStack>
  );
};

const AccountSwitcherSessions = ({ sessions }: { sessions: Session[] }) => {
  const { session, setSession } = useAuth();
  const { data, isLoading } = useUsers(sessions?.map((session) => session.fid));

  if (isLoading) return <Spinner color="$color11" />;

  return (
    <YStack>
      {data?.data?.map((user) => {
        const userSession = sessions.find((s) => s.fid === user.fid);
        if (!userSession) return null;
        return (
          <NookButton
            key={user.fid}
            variant="ghost"
            height="$6"
            onPress={async () => {
              await setSession(userSession);
              window.location.reload();
            }}
            disabled={session?.fid === user.fid}
          >
            <XStack justifyContent="space-between" alignItems="center" flex={1}>
              <FarcasterUserDisplay key={user.fid} user={user} />
              {session?.fid === user.fid && (
                <View
                  backgroundColor="$color8"
                  borderRadius="$12"
                  padding="$1.5"
                >
                  <Check size={10} strokeWidth={4} color="white" />
                </View>
              )}
            </XStack>
          </NookButton>
        );
      })}
    </YStack>
  );
};
