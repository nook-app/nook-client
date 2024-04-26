// TODO: Move this to backend with our own explore routes

import { fetchSettings } from "@nook/app/api/settings";
import { NavigationHeader } from "../../../../components/NavigationHeader";
import { PageNavigation } from "../../../../components/PageNavigation";
import { MutedChannels } from "@nook/app/features/settings/muted-channels";

export default async function Settings() {
  const settings = await fetchSettings();
  return (
    <PageNavigation>
      <NavigationHeader title="Muted Channels" />
      <MutedChannels settings={settings} />
    </PageNavigation>
  );
}
