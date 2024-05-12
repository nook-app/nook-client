import { ScrollView } from "@nook/app-ui";
import { useAuth } from "@nook/app/context/auth";
import { MutedWords } from "@nook/app/features/settings/muted-words";

export default function MuteWordsScreen() {
  const { settings } = useAuth();
  if (!settings) return null;
  return (
    <ScrollView backgroundColor="$color1">
      <MutedWords settings={settings} />
    </ScrollView>
  );
}
