import { fetchSettings } from "@nook/app/api/settings";
import { NavigationHeader } from "../../../../components/NavigationHeader";
import { MutedWords } from "@nook/app/features/settings/muted-words";

export default async function Settings() {
  const settings = await fetchSettings();
  return (
    <>
      <NavigationHeader title="Muted Words" />
      <MutedWords settings={settings} />
    </>
  );
}
