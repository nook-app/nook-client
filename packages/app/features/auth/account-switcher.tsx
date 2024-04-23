import { NookButton, Popover, Separator, View, XStack, YStack } from "@nook/ui";
import { ReactNode } from "react";
import { useAuth } from "../../context/auth";
import { Session } from "../../types";
import { useUsers } from "../../api/farcaster";
import { FarcasterUserDisplay } from "../../components/farcaster/users/user-display";
import { Check } from "@tamagui/lucide-icons";

export const AccountSwitcher = ({ children }: { children: ReactNode }) => {
  return (
    <Popover placement="top" size="$5" allowFlip>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Content
        borderWidth={1}
        borderColor="$borderColor"
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
        <Popover.Arrow borderWidth={1} borderColor="$borderColor" />
        <AccountSwitcherContent />
      </Popover.Content>
    </Popover>
  );
};

const AccountSwitcherContent = () => {
  const { login, logout, user } = useAuth();

  const rawSessions = localStorage.getItem("sessions");
  const sessions: Session[] = rawSessions ? JSON.parse(rawSessions) : [];

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
      {user && (
        <NookButton variant="ghost" height="$4" onPress={logout}>{`Log out ${
          user.username ? `@${user.username}` : `!${user.fid}`
        }`}</NookButton>
      )}
    </YStack>
  );
};

const AccountSwitcherSessions = ({ sessions }: { sessions: Session[] }) => {
  const { session, setSession } = useAuth();
  const { data } = useUsers(sessions.map((session) => session.fid));

  if (!data) return null;

  return (
    <YStack>
      {data.data.map((user) => {
        const userSession = sessions.find((s) => s.fid === user.fid);
        if (!userSession) return null;
        return (
          <NookButton
            variant="ghost"
            height="$6"
            onPress={() => setSession(userSession)}
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
