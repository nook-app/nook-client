import { MenuSquare, Volume, VolumeX } from "@tamagui/lucide-icons";
import { Channel } from "@nook/common/types";
import { useMuteChannel } from "../../../hooks/useMuteChannel";
import { Menu } from "../../menu/menu";
import { MenuItem } from "../../menu/menu-item";
import { useAuth } from "../../../context/auth";
import { useMenu } from "../../menu/context";
import { ReactNode, useCallback } from "react";
import { CopyLink, OpenWarpcast } from "../../menu/menu-actions";
import { Link } from "../../link";
import { Platform } from "react-native";

export const FarcasterChannelMenu = ({
  channel,
  trigger,
}: { channel: Channel; trigger: ReactNode }) => {
  return (
    <Menu trigger={trigger}>
      <AddChannelToList channel={channel} />
      <MuteChannel channel={channel} />
      <CopyLink link={`https://nook.social/channels/${channel.channelId}`} />
      <OpenWarpcast
        link={`https://warpcast.com/~/channel/${channel.channelId}`}
      />
    </Menu>
  );
};

const MuteChannel = ({ channel }: { channel: Channel }) => {
  const { isMuted, muteChannel, unmuteChannel } = useMuteChannel(channel);
  const { session } = useAuth();
  const { close } = useMenu();

  const Icon = isMuted ? Volume : VolumeX;
  const title = `${isMuted ? "Unmute" : "Mute"} /${channel.channelId}`;

  const handlePress = useCallback(() => {
    if (isMuted) {
      unmuteChannel();
    } else {
      muteChannel();
    }
    close();
  }, [isMuted, unmuteChannel, muteChannel, close]);

  if (!session) {
    return null;
  }

  return <MenuItem Icon={Icon} title={title} onPress={handlePress} />;
};

const AddChannelToList = ({ channel }: { channel: Channel }) => {
  const { session } = useAuth();
  const { close } = useMenu();

  if (!session || Platform.OS === "web") {
    return null;
  }

  return (
    <Link
      href={{
        pathname: "/lists/manage",
        params: { channel: JSON.stringify(channel) },
      }}
      onPress={close}
    >
      <MenuItem Icon={MenuSquare} title="Add/remove from channel list" />
    </Link>
  );
};
