import { SettingsScreen } from "@nook/app/features/settings/settings-screen";
import { fetchSettings } from "@nook/app/api/settings";

export default async function Settings() {
  const settings = await fetchSettings();
  return <SettingsScreen settings={settings} />;
}
