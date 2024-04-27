import { fetchSettings } from "@nook/app/api/settings";
import { NavigationHeader } from "../../../../components/NavigationHeader";
import { MutedChannels } from "@nook/app/features/settings/muted-channels";

export default async function Settings() {
  const settings = await fetchSettings();
  return (
    <>
      <NavigationHeader title="Muted Channels" />
      <MutedChannels settings={settings} />
    </>
  );
}
