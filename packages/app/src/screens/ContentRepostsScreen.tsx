import { NookPanelType } from "@nook/common/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { Panel } from "@/components/panels/Panels";
import { View } from "tamagui";

export const ContentRepostsScreen = () => {
  const {
    params: { contentId },
  } = useRoute<RouteProp<RootStackParamList, "ContentReposts">>();

  return (
    <View backgroundColor="$background" height="100%">
      <Panel
        panel={{
          type: NookPanelType.PostReposts,
          args: {
            targetContentId: contentId,
          },
        }}
      />
    </View>
  );
};
