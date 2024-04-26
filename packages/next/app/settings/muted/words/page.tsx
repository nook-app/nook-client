// TODO: Move this to backend with our own explore routes

import { fetchSettings } from "@nook/app/api/settings";
import { NavigationHeader } from "../../../../components/NavigationHeader";
import { PageNavigation } from "../../../../components/PageNavigation";
import { MutedWords } from "@nook/app/features/settings/muted-words";

export default async function Settings() {
  const settings = await fetchSettings();
  return (
    <PageNavigation>
      <NavigationHeader title="Muted Words" />
      <MutedWords settings={settings} />
    </PageNavigation>
  );
}
