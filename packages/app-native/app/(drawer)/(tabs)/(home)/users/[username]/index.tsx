import { View } from "@nook/app-ui";
import { UserHeader } from "@nook/app/features/farcaster/user-profile/user-header";
import { useUser } from "@nook/app/hooks/useUser";
import { useLocalSearchParams } from "expo-router";

export default function UserScreen() {
  const { username } = useLocalSearchParams();
  const { user } = useUser(username as string);
  return (
    <View flex={1} backgroundColor="$color1">
      {user && <UserHeader user={user} size="$7" />}
    </View>
  );
}
