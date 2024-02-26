import { NookPanelType, UserFilterType } from "@nook/common/types";
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { Panels } from "@/components/panels/Panels";
import { useEffect } from "react";
import { useEntity } from "@/hooks/useEntity";

export const EntityFollowersScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const {
    params: { entityId, defaultTab },
  } = useRoute<RouteProp<RootStackParamList, "EntityFollowers">>();
  const { username } = useEntity(entityId);

  useEffect(() => {
    navigation.setOptions({
      title: username || "",
    });
  }, [username, navigation]);

  return (
    <Panels
      defaultTab={defaultTab}
      panels={[
        {
          name: "Following",
          slug: "following",
          data: {
            type: NookPanelType.UserFollowing,
            args: {
              userFilter: {
                type: UserFilterType.Entities,
                args: {
                  entityIds: [entityId],
                },
              },
            },
          },
        },
        {
          name: "Followers",
          slug: "followers",
          data: {
            type: NookPanelType.UserFollowers,
            args: {
              userFilter: {
                type: UserFilterType.Entities,
                args: {
                  entityIds: [entityId],
                },
              },
            },
          },
        },
      ]}
    />
  );
};
