import { ScrollView } from "@nook/app-ui";
import { ActionSettings } from "@nook/app/features/settings/action-settings";

export default function ActionSettingsScreen() {
  return (
    <ScrollView backgroundColor="$color1">
      <ActionSettings />
    </ScrollView>
  );
}
