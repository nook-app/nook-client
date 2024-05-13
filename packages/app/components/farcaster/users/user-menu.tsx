import { useAuth } from "../../../context/auth";
import { Volume, VolumeX } from "@tamagui/lucide-icons";
import { FarcasterUser } from "@nook/common/types";
import { Image } from "@nook/app-ui";
import { useMuteUser } from "../../../hooks/useMuteUser";
import { useMenu } from "../../menu/context";
import { ReactNode, useCallback } from "react";
import { MenuItem } from "../../menu/menu-item";
import { Menu } from "../../menu/menu";
import { CopyLink, OpenLink } from "../../menu/menu-actions";

export const FarcasterUserMenu = ({
  user,
  trigger,
}: { user: FarcasterUser; trigger: ReactNode }) => {
  return (
    <Menu trigger={trigger}>
      <MuteUser user={user} />
      <CopyLink link={`https://nook.social/users/${user.username}`} />
      <OpenLink
        link={`https://warpcast.com/${user.username}`}
        Icon={
          <Image source={{ uri: "/warpcast.svg" }} width={14} height={14} />
        }
        title="View on Warpcast"
      />
    </Menu>
  );
};

const MuteUser = ({ user }: { user: FarcasterUser }) => {
  const { session } = useAuth();
  const { isMuted, muteUser, unmuteUser } = useMuteUser(user);
  const { close } = useMenu();

  const Icon = isMuted ? Volume : VolumeX;
  const title = `${isMuted ? "Unmute" : "Mute"} ${
    user.username ? `@${user.username}` : `!${user.fid}`
  }`;

  const handlePress = useCallback(() => {
    if (isMuted) {
      unmuteUser();
    } else {
      muteUser();
    }
    close();
  }, [isMuted, unmuteUser, muteUser, close]);

  if (!session || user.fid === session?.fid) {
    return null;
  }

  return <MenuItem Icon={Icon} title={title} onPress={handlePress} />;
};
