import { ScrollView } from "@nook/app-ui";
import { ProfileSettings } from "@nook/app/features/settings/profile-settings";

export default function ProfileSettingsScreen() {
  return (
    <ScrollView backgroundColor="$color1">
      <ProfileSettings />
    </ScrollView>
  );
}
