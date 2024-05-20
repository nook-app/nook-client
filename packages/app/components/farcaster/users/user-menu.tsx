import { useAuth } from "../../../context/auth";
import { MenuSquare, Volume, VolumeX } from "@tamagui/lucide-icons";
import { FarcasterUser } from "@nook/common/types";
import { useMuteUser } from "../../../hooks/useMuteUser";
import { useMenu } from "../../menu/context";
import { ReactNode, useCallback } from "react";
import { MenuItem } from "../../menu/menu-item";
import { Menu } from "../../menu/menu";
import { CopyLink, OpenWarpcast } from "../../menu/menu-actions";
import { Link } from "../../link";
import { Platform } from "react-native";

export const FarcasterUserMenu = ({
  user,
  trigger,
}: { user: FarcasterUser; trigger: ReactNode }) => {
  return (
    <Menu trigger={trigger}>
      <AddUserToList user={user} />
      <MuteUser user={user} />
      <ViewFeed user={user} />
      <CopyLink link={`https://nook.social/users/${user.username}`} />
      <OpenWarpcast link={`https://warpcast.com/${user.username}`} />
    </Menu>
  );
};

const ViewFeed = ({ user }: { user: FarcasterUser }) => {
  const { close } = useMenu();
  return (
    <Link href={`/users/${user.username}/feed`} onPress={close}>
      <MenuItem Icon={MenuSquare} title="View feed" />
    </Link>
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

const AddUserToList = ({ user }: { user: FarcasterUser }) => {
  const { session } = useAuth();
  const { close } = useMenu();

  if (!session || Platform.OS === "web") {
    return null;
  }

  return (
    <Link
      href={{
        pathname: "/lists/manage",
        params: { user: JSON.stringify(user) },
      }}
      onPress={close}
    >
      <MenuItem Icon={MenuSquare} title="Add/remove from user list" />
    </Link>
  );
};
