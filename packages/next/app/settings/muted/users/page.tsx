// TODO: Move this to backend with our own explore routes

import { fetchSettings } from "@nook/app/api/settings";
import { NavigationHeader } from "../../../../components/NavigationHeader";
import { PageNavigation } from "../../../../components/PageNavigation";
import { MutedUsers } from "@nook/app/features/settings/muted-users";

export default async function Settings() {
  const settings = await fetchSettings();
  return (
    <PageNavigation>
      <NavigationHeader title="Muted Users" />
      <MutedUsers settings={settings} />
    </PageNavigation>
  );
}
