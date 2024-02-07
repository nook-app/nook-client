import { View } from "tamagui";
import { useAppSelector } from "@hooks/useAppSelector";
import { Feed } from "@components/feed";

export default function FeedScreen() {
  const activeNook = useAppSelector((state) => state.user.activeNook);

  return (
    <View backgroundColor="$background" theme={activeNook.theme} height="100%">
      <Feed filter={activeNook.panels[0].filter} />
    </View>
  );
}
