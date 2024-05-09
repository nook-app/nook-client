import { View } from "@nook/app-ui";
import { useChannel } from "@nook/app/hooks/useChannel";
import { ChannelHeader } from "@nook/app/features/farcaster/channel-profile/channel-header";
import { useLocalSearchParams } from "expo-router";

export default function ChannelScreen() {
  const { channelId } = useLocalSearchParams();
  const { channel } = useChannel(channelId as string);

  return (
    <View flex={1} backgroundColor="$color1">
      {channel && <ChannelHeader channel={channel} />}
    </View>
  );
}
