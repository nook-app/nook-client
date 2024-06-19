import { ScrollView } from "@nook/app-ui";
import { useAuth } from "@nook/app/context/auth";
import { MutedUsers } from "@nook/app/features/settings/muted-users";

export default function MuteUsersScreen() {
  const { settings } = useAuth();
  if (!settings) return null;
  return (
    <ScrollView backgroundColor="$color1">
      <MutedUsers settings={settings} />
    </ScrollView>
  );
}
