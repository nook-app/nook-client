import { useLocalSearchParams } from "expo-router";
import { View } from "@nook/app-ui";
import { FarcasterChannelHosts } from "@nook/app/features/farcaster/channel-profile/channel-hosts";

export default function ChannelHostsScreen() {
  const { channelId } = useLocalSearchParams();
  return (
    <View flexGrow={1} backgroundColor="$color1">
      <FarcasterChannelHosts channelId={channelId as string} />
    </View>
  );
}
