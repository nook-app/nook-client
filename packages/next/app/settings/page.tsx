// TODO: Move this to backend with our own explore routes

import { NavigationHeader } from "../../components/NavigationHeader";
import { PageNavigation } from "../../components/PageNavigation";
import { SettingsScreen } from "@nook/app/features/settings/settings-screen";
import { fetchSettings } from "@nook/app/api/settings";

export default async function Settings() {
  const settings = await fetchSettings();
  return (
    <PageNavigation>
      <NavigationHeader title="Settings" />
      <SettingsScreen settings={settings} />
    </PageNavigation>
  );
}
