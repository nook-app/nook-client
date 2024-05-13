import { MoreHorizontal, Volume, VolumeX } from "@tamagui/lucide-icons";
import { Channel } from "@nook/common/types";
import { Image, NookButton, Popover } from "@nook/app-ui";
import { useMuteChannel } from "../../../hooks/useMuteChannel";
import { Menu } from "../../menu/menu";
import { MenuItem } from "../../menu/menu-item";
import { useAuth } from "../../../context/auth";
import { useMenu } from "../../menu/context";
import { ReactNode, useCallback } from "react";
import { CopyLink, OpenLink } from "../../menu/menu-actions";

export const FarcasterChannelMenu = ({
  channel,
  trigger,
}: { channel: Channel; trigger: ReactNode }) => {
  return (
    <Menu trigger={trigger}>
      <MuteChannel channel={channel} />
      <CopyLink link={`https://nook.social/channels/${channel.channelId}`} />
      <OpenLink
        link={`https://warpcast.com/~/channel/${channel.channelId}`}
        Icon={
          <Image source={{ uri: "/warpcast.svg" }} width={14} height={14} />
        }
        title="View on Warpcast"
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
