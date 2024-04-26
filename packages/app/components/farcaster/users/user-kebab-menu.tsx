import { useAuth } from "../../../context/auth";
import { Link, MoreHorizontal, Volume, VolumeX } from "@tamagui/lucide-icons";
import { FarcasterUser } from "../../../types";
import { KebabMenu, KebabMenuItem } from "../../kebab-menu";
import { useCallback } from "react";
import { NookButton, useToastController } from "@nook/ui";
import { muteUser, unmuteUser } from "../../../server/settings";
import { useQueryClient } from "@tanstack/react-query";

export const FarcasterUserKebabMenu = ({ user }: { user: FarcasterUser }) => {
  const toast = useToastController();
  return (
    <KebabMenu
      trigger={
        <NookButton variant="active-action" width="$3" height="$3" padding="$0">
          <MoreHorizontal size={20} />
        </NookButton>
      }
    >
      <MuteUser user={user} />
      <KebabMenuItem
        Icon={Link}
        title="Copy link"
        onPress={() => {
          navigator.clipboard.writeText(
            `https://nook.social/users/${user.username}`,
          );
          toast.show("Link copied to clipboard");
        }}
      />
    </KebabMenu>
  );
};

const MuteUser = ({
  user,
  closeMenu,
}: { user: FarcasterUser; closeMenu?: () => void }) => {
  const { session, settings, login } = useAuth();
  const queryClient = useQueryClient();

  if (user.fid === session?.fid) {
    return null;
  }

  const isMuted = settings?.mutedUsers.includes(user.fid);

  const handleMute = useCallback(async () => {
    if (!session) {
      login();
      return;
    }
    await muteUser(user.fid);
    queryClient.invalidateQueries({ queryKey: ["settings"] });
  }, [user.fid, queryClient, session, login]);

  const handleUnmute = useCallback(async () => {
    if (!session) {
      login();
      return;
    }
    await unmuteUser(user.fid);
    queryClient.invalidateQueries({ queryKey: ["settings"] });
  }, [user.fid, queryClient, session, login]);

  if (isMuted) {
    return (
      <KebabMenuItem
        Icon={Volume}
        title={`Unmute ${user.username ? `@${user.username}` : `!${user.fid}`}`}
        color="$mauve12"
        onPress={handleUnmute}
        closeMenu={closeMenu}
      />
    );
  }

  return (
    <KebabMenuItem
      Icon={VolumeX}
      title={`Mute ${user.username ? `@${user.username}` : `!${user.fid}`}`}
      onPress={handleMute}
      closeMenu={closeMenu}
    />
  );
};
