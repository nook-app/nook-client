import { Text, View, XStack, YStack } from "tamagui";
import { EntityAvatar } from "@/components/entity/EntityAvatar";
import { useEntity } from "@/hooks/useEntity";
import { formatNumber } from "@/utils";
import { ContentType, NookPanelType, TopicType } from "@nook/common/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { Panels } from "@/components/panels/Panels";

const EntityHeader = () => {
  const {
    params: { entityId },
  } = useRoute<RouteProp<RootStackParamList, "Entity">>();
  const { entity, displayName, username, bio, following, followers } =
    useEntity(entityId);
  if (!entity) return null;

  return (
    <YStack gap="$4" backgroundColor="$background" padding="$3">
      <XStack gap="$2" alignItems="center">
        <EntityAvatar entityId={entityId} size="$5" />
        <YStack>
          <Text fontWeight="700" fontSize="$5">
            {displayName}
          </Text>
          <Text color="$gray11" fontSize="$4">
            {username}
          </Text>
        </YStack>
      </XStack>
      {bio && <Text>{bio}</Text>}
      <XStack gap="$2">
        <View flexDirection="row" alignItems="center" gap="$1">
          <Text fontWeight="700">{formatNumber(following)}</Text>
          <Text color="$gray11">following</Text>
        </View>
        <View flexDirection="row" alignItems="center" gap="$1">
          <Text fontWeight="700">{formatNumber(followers)}</Text>
          <Text color="$gray11">followers</Text>
        </View>
      </XStack>
    </YStack>
  );
};

export const EntityScreen = () => {
  const {
    params: { entityId },
  } = useRoute<RouteProp<RootStackParamList, "Entity">>();

  return (
    <Panels
      renderHeader={EntityHeader}
      panels={[
        {
          name: "Posts",
          slug: "posts",
          type: NookPanelType.ContentFeed,
          args: {
            filter: {
              type: ContentType.POST,
              topics: {
                type: TopicType.SOURCE_ENTITY,
                value: entityId,
              },
            },
          },
        },
        {
          name: "Replies",
          slug: "replies",
          type: NookPanelType.ContentFeed,
          args: {
            filter: {
              type: ContentType.REPLY,
              topics: {
                type: TopicType.SOURCE_ENTITY,
                value: entityId,
              },
            },
          },
        },
      ]}
    />
  );
};
