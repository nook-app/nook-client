import {
  Adapt,
  NookButton,
  NookText,
  Popover,
  Separator,
  Spinner,
  View,
  XStack,
  YStack,
} from "@nook/app-ui";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/auth";
import { Session } from "@nook/common/types";
import { FarcasterUserDisplay } from "../../components/farcaster/users/user-display";
import { Check } from "@tamagui/lucide-icons";
import { getSessions } from "../../utils/local-storage";
import { Link } from "../../components/link";
import { Platform } from "react-native";
import { useUsers } from "../../hooks/api/users";

export const AccountSwitcher = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState<boolean>(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <Popover
      placement="top"
      size="$5"
      allowFlip
      open={open}
      onOpenChange={setOpen}
    >
      <Popover.Trigger asChild>{children}</Popover.Trigger>

      <Adapt when="sm" platform="touch">
        <Popover.Sheet modal dismissOnSnapToBottom snapPointsMode="fit">
          <Popover.Sheet.Overlay
            animation="100ms"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <Popover.Sheet.Frame
            paddingBottom="$8"
            paddingTop="$2"
            backgroundColor="$color2"
          >
            <Adapt.Contents />
          </Popover.Sheet.Frame>
        </Popover.Sheet>
      </Adapt>
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
        <AccountSwitcherContent close={close} />
      </Popover.Content>
    </Popover>
  );
};

const AccountSwitcherContent = ({ close }: { close: () => void }) => {
  const { login, logout, user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (user) {
      getSessions().then(setSessions);
      setIsLoggingIn(false);
    }
  }, [user]);

  return (
    <YStack minWidth="$19">
      {sessions.length > 0 && (
        <>
          <AccountSwitcherSessions sessions={sessions} close={close} />
          <Separator marginVertical="$2" />
        </>
      )}
      <NookButton
        variant="ghost"
        height="$4"
        onPress={() => {
          login();
          setIsLoggingIn(true);
        }}
      >
        {isLoggingIn ? (
          <XStack gap="$2">
            <Spinner />
            <NookText fontWeight="600" fontSize="$4">
              Adding account...
            </NookText>
          </XStack>
        ) : (
          "Add an existing account"
        )}
      </NookButton>
      {Platform.OS === "web" && (
        <Link href="/signup">
          <NookButton variant="ghost" height="$4">
            Create a new account
          </NookButton>
        </Link>
      )}
      {user && (
        <>
          <Link href={`/users/${user.username || user.fid}`} unpressable>
            <NookButton variant="ghost" height="$4" onPress={close}>{`View ${
              user.username ? `@${user.username}` : `!${user.fid}`
            }`}</NookButton>
          </Link>
          <NookButton
            variant="ghost"
            height="$4"
            onPress={() => {
              logout();
              close();
            }}
          >{`Log out ${
            user.username ? `@${user.username}` : `!${user.fid}`
          }`}</NookButton>
        </>
      )}
    </YStack>
  );
};

const AccountSwitcherSessions = ({
  sessions,
  close,
}: { sessions: Session[]; close: () => void }) => {
  const { session, setSession } = useAuth();
  const { data, isLoading } = useUsers(sessions?.map((session) => session.fid));

  if (isLoading) return <Spinner />;

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
              close();
              if (Platform.OS === "web") {
                window.location.reload();
              }
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
