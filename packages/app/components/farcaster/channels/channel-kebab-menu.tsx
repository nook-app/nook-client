import { useAuth } from "../../../context/auth";
import { Link, MoreHorizontal, Volume, VolumeX } from "@tamagui/lucide-icons";
import { Channel } from "../../../types";
import { KebabMenu, KebabMenuItem } from "../../kebab-menu";
import { useCallback } from "react";
import { NookButton, useToastController } from "@nook/ui";
import { muteChannel, unmuteChannel } from "../../../server/settings";
import { useQueryClient } from "@tanstack/react-query";

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
    </KebabMenu>
  );
};

const MuteChannel = ({
  channel,
  closeMenu,
}: { channel: Channel; closeMenu?: () => void }) => {
  const { session, settings } = useAuth();
  const queryClient = useQueryClient();

  if (!channel) {
    return null;
  }

  const isMuted = settings?.mutedChannels.includes(channel.url);

  const handleMute = useCallback(async () => {
    if (!channel) return;
    await muteChannel(channel.url);
    queryClient.invalidateQueries({ queryKey: ["settings"] });
  }, [channel, queryClient]);

  const handleUnmute = useCallback(async () => {
    if (!channel) return;
    await unmuteChannel(channel.url);
    queryClient.invalidateQueries({ queryKey: ["settings"] });
  }, [channel, queryClient]);

  if (isMuted) {
    return (
      <KebabMenuItem
        Icon={Volume}
        title={`Unmute /${channel?.channelId}`}
        color="$mauve12"
        onPress={handleUnmute}
        closeMenu={closeMenu}
      />
    );
  }

  return (
    <KebabMenuItem
      Icon={VolumeX}
      title={`Mute /${channel?.channelId}`}
      onPress={handleMute}
      closeMenu={closeMenu}
    />
  );
};
