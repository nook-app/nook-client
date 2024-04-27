import { fetchSettings } from "@nook/app/api/settings";
import { NavigationHeader } from "../../../../components/NavigationHeader";
import { MutedUsers } from "@nook/app/features/settings/muted-users";

export default async function Settings() {
  const settings = await fetchSettings();
  return (
    <>
      <NavigationHeader title="Muted Users" />
      <MutedUsers settings={settings} />
    </>
  );
}
