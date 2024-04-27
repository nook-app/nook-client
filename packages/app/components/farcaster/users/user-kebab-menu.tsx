import { useAuth } from "../../../context/auth";
import { Link, MoreHorizontal, Volume, VolumeX } from "@tamagui/lucide-icons";
import { FarcasterUser } from "../../../types";
import { KebabMenu, KebabMenuItem } from "../../kebab-menu";
import { Image, NookButton, useToastController } from "@nook/ui";
import { useMuteUser } from "../../../hooks/useMuteUser";

export const FarcasterUserKebabMenu = ({ user }: { user: FarcasterUser }) => {
  const toast = useToastController();
  return (
    <KebabMenu
      trigger={
        <NookButton variant="active-action" width="$3" height="$3" padding="$0">
          <MoreHorizontal size={20} color="$mauve12" />
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
      <KebabMenuItem
        Icon={
          <Image source={{ uri: "/warpcast.svg" }} width={14} height={14} />
        }
        title="View on Warpcast"
        onPress={() => window.open(`https://warpcast.com/${user.username}`)}
      />
    </KebabMenu>
  );
};

const MuteUser = ({
  user,
  closeMenu,
}: { user: FarcasterUser; closeMenu?: () => void }) => {
  const { session } = useAuth();
  const { isMuted, muteUser, unmuteUser } = useMuteUser(user);

  if (user.fid === session?.fid) {
    return null;
  }

  if (isMuted) {
    return (
      <KebabMenuItem
        Icon={Volume}
        title={`Unmute ${user.username ? `@${user.username}` : `!${user.fid}`}`}
        color="$mauve12"
        onPress={unmuteUser}
        closeMenu={closeMenu}
      />
    );
  }

  return (
    <KebabMenuItem
      Icon={VolumeX}
      title={`Mute ${user.username ? `@${user.username}` : `!${user.fid}`}`}
      onPress={muteUser}
      closeMenu={closeMenu}
    />
  );
};
