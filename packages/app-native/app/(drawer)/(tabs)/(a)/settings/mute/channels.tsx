import { ScrollView } from "@nook/app-ui";
import { useAuth } from "@nook/app/context/auth";
import { MutedChannels } from "@nook/app/features/settings/muted-channels";

export default function MuteChannelsScreen() {
  const { settings } = useAuth();
  if (!settings) return null;
  return (
    <ScrollView backgroundColor="$color1">
      <MutedChannels settings={settings} />
    </ScrollView>
  );
}
