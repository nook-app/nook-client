import { ScrollView } from "@nook/app-ui";
import { ThemeSettings } from "@nook/app/features/settings/theme-settings";

export default function ThemeSettingsScreen() {
  return (
    <ScrollView backgroundColor="$color1">
      <ThemeSettings />
    </ScrollView>
  );
}
