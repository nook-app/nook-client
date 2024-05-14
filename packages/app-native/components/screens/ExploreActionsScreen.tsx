import { View } from "@nook/app-ui";
import { ExploreActions } from "@nook/app/features/explore/explore-actions";

export default function ExploreActionsScreen() {
  return (
    <View flex={1} backgroundColor="$color1">
      <ExploreActions />
    </View>
  );
}
