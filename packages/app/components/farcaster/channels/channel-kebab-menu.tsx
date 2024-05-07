import { Link, MoreHorizontal, Volume, VolumeX } from "@tamagui/lucide-icons";
import { Channel } from "@nook/common/types";
import { KebabMenu, KebabMenuItem } from "../../kebab-menu";
import { Image, NookButton, useToastController } from "@nook/app-ui";
import { useMuteChannel } from "../../../hooks/useMuteChannel";

export const FarcasterChannelKebabMenu = ({
  channel,
}: { channel: Channel }) => {
  const toast = useToastController();
  return (
    <KebabMenu
      trigger={
        <NookButton variant="active-action" width="$3" height="$3" padding="$0">
          <MoreHorizontal size={20} />
        </NookButton>
      }
    >
      <MuteChannel channel={channel} />
      <KebabMenuItem
        Icon={Link}
        title="Copy link"
        onPress={() => {
          navigator.clipboard.writeText(
            `https://nook.social/channels/${channel.channelId}`,
          );
          toast.show("Link copied to clipboard");
        }}
      />
      <KebabMenuItem
        Icon={
          <Image source={{ uri: "/warpcast.svg" }} width={14} height={14} />
        }
        title="View on Warpcast"
        onPress={() =>
          window.open(`https://warpcast.com/~/channel/${channel.channelId}`)
        }
      />
    </KebabMenu>
  );
};

const MuteChannel = ({
  channel,
  closeMenu,
}: { channel: Channel; closeMenu?: () => void }) => {
  const { isMuted, muteChannel, unmuteChannel } = useMuteChannel(channel);

  if (isMuted) {
    return (
      <KebabMenuItem
        Icon={Volume}
        title={`Unmute /${channel?.channelId}`}
        color="$mauve12"
        onPress={unmuteChannel}
        closeMenu={closeMenu}
      />
    );
  }

  return (
    <KebabMenuItem
      Icon={VolumeX}
      title={`Mute /${channel?.channelId}`}
      onPress={muteChannel}
      closeMenu={closeMenu}
    />
  );
};
