import { Text, View, XStack, YStack } from "tamagui";
import { UserAvatar } from "@/components/user/UserAvatar";
import { useUser } from "@/hooks/useUser";
import { formatNumber } from "@/utils";
import { NookPanelType } from "@nook/common/types";
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { Panels } from "@/components/panels/Panels";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useEffect } from "react";

const UserHeader = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const {
    params: { userId },
  } = useRoute<RouteProp<RootStackParamList, "User">>();
  const { displayName, username, bio, following, followers } = useUser(userId);

  useEffect(() => {
    navigation.setOptions({
      title: username || "",
    });
  }, [username, navigation]);

  return (
    <YStack gap="$4" backgroundColor="$background" padding="$3">
      <View flexDirection="row" justifyContent="space-between">
        <XStack gap="$2" alignItems="center">
          <UserAvatar userId={userId} size="$5" />
          <YStack>
            <Text fontWeight="700" fontSize="$5">
              {displayName}
            </Text>
            <Text color="$gray11" fontSize="$4">
              {username}
            </Text>
          </YStack>
        </XStack>
        {/* {context?.following ? (
          <Button size="$3" variant="outlined" borderColor="$backgroundHover">
            Unfollow
          </Button>
        ) : (
          <Button size="$3">Follow</Button>
        )} */}
      </View>
      {bio && <Text>{bio}</Text>}
      <XStack gap="$2">
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("EntityFollowers", {
              userId,
              defaultTab: "Followers",
            })
          }
        >
          <View flexDirection="row" alignItems="center" gap="$1">
            <Text fontWeight="700">{formatNumber(following)}</Text>
            <Text color="$gray11">following</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("EntityFollowers", {
              userId,
              defaultTab: "Followers",
            })
          }
        >
          <View flexDirection="row" alignItems="center" gap="$1">
            <Text fontWeight="700">{formatNumber(followers)}</Text>
            <Text color="$gray11">followers</Text>
          </View>
        </TouchableOpacity>
      </XStack>
    </YStack>
  );
};

export const UserScreen = () => {
  const {
    params: { userId },
  } = useRoute<RouteProp<RootStackParamList, "User">>();
  return (
    <Panels
      renderHeader={UserHeader}
      panels={[
        {
          id: "posts",
          name: "Posts",
          data: {
            type: NookPanelType.FarcasterFeed,
            args: {
              feedId: `user:casts:${userId}`,
            },
          },
        },
        {
          id: "replies",
          name: "Replies",
          data: {
            type: NookPanelType.FarcasterFeed,
            args: {
              feedId: `user:replies:${userId}`,
            },
          },
        },
      ]}
    />
  );
};
