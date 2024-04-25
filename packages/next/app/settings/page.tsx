// TODO: Move this to backend with our own explore routes

import { NavigationHeader } from "../../components/NavigationHeader";
import { PageNavigation } from "../../components/PageNavigation";
import { SettingsScreen } from "@nook/app/features/settings/settings-screen";

export default async function Settings() {
  return (
    <PageNavigation>
      <NavigationHeader title="Settings" />
      <SettingsScreen />
    </PageNavigation>
  );
}
