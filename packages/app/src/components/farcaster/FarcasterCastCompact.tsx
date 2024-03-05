import { Separator, Text, View, XStack, YStack, useTheme } from "tamagui";
import { UserAvatar } from "@/components/user/UserAvatar";
import { FarcasterCastText } from "@/components/farcaster/FarcasterCastText";
import { UserDisplay } from "../user/UserDisplay";
import { Heart, MessageSquare, RefreshCw } from "@tamagui/lucide-icons";
import { formatTimeAgo } from "@/utils";
import { ChannelDisplay } from "../channel/ChannelDisplay";
import { FarcasterCastResponseWithContext } from "@nook/common/types";
import { Embed } from "../embeds/Embed";
import { EmbedCast } from "../embeds/EmbedCast";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { farcasterApi } from "@/store/apis/farcasterApi";

export const FarcasterCastCompact = ({
  cast,
  isParent,
}: { cast: FarcasterCastResponseWithContext; isParent?: boolean }) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const showParentContext = isParent && !!cast.parent;

  return (
    <XStack gap="$2">
      <View width="$3.5" alignItems="center">
        <UserAvatar userId={cast.user.fid} />
        {isParent && <Separator vertical />}
      </View>
      <YStack flex={1} gap="$1" paddingBottom={isParent ? "$2" : "$0"}>
        <View alignSelf="flex-start">
          <UserDisplay userId={cast.user.fid} />
        </View>
        <XStack alignItems="center" gap="$1.5">
          <Text color="$gray11">{formatTimeAgo(cast.timestamp)}</Text>
          {showParentContext && cast.parent?.user && (
            <>
              <Text color="$gray11">replying to</Text>
              <UserDisplay userId={cast.parent.user.fid} hideDisplayName />
            </>
          )}
          {cast.channel && !showParentContext && (
            <>
              <Text color="$gray11">in</Text>
              <ChannelDisplay channel={cast.channel} />
            </>
          )}
        </XStack>
        {cast.text && (
          <View paddingVertical="$1.5">
            <FarcasterCastText cast={cast} />
          </View>
        )}
        {(cast.embeds.length > 0 || cast.embeds.length > 0) && (
          <YStack gap="$2">
            {cast.embeds.map((content) => (
              <Embed key={content.uri} content={content} />
            ))}
            {cast.embedCasts.map((cast) => (
              <EmbedCast key={cast.hash} cast={cast} />
            ))}
          </YStack>
        )}
        {cast.engagement && (
          <XStack justifyContent="space-between" width="$15" paddingTop="$2">
            <View flexDirection="row" alignItems="center" gap="$1.5" width="$3">
              <MessageSquare size={16} color="$gray10" />
              <Text color="$gray10" fontSize="$4">
                {cast.engagement.replies}
              </Text>
            </View>
            <View flexDirection="row" alignItems="center" gap="$1.5" width="$3">
              <TouchableOpacity
                onPress={
                  cast.context
                    ? cast.context.liked
                      ? () =>
                          dispatch(
                            farcasterApi.endpoints.unrecastCast.initiate({
                              hash: cast.hash,
                            }),
                          )
                      : () =>
                          dispatch(
                            farcasterApi.endpoints.recastCast.initiate({
                              hash: cast.hash,
                            }),
                          )
                    : () => {}
                }
              >
                <RefreshCw
                  size={16}
                  color={cast.context?.recasted ? "$green9" : "$gray10"}
                  fill={
                    cast.context?.recasted
                      ? theme.$green9.val
                      : theme.$background.val
                  }
                />
                <Text color="$gray10" fontSize="$4">
                  {cast.engagement.recasts}
                </Text>
              </TouchableOpacity>
            </View>
            <View flexDirection="row" alignItems="center" gap="$1.5" width="$3">
              <TouchableOpacity
                onPress={
                  cast.context
                    ? cast.context.liked
                      ? () =>
                          dispatch(
                            farcasterApi.endpoints.unlikeCast.initiate({
                              hash: cast.hash,
                            }),
                          )
                      : () =>
                          dispatch(
                            farcasterApi.endpoints.likeCast.initiate({
                              hash: cast.hash,
                            }),
                          )
                    : () => {}
                }
              >
                <Heart
                  size={16}
                  color={cast.context?.liked ? "$red9" : "$gray10"}
                  fill={
                    cast.context?.liked
                      ? theme.$red9.val
                      : theme.$background.val
                  }
                />
                <Text color="$gray10" fontSize="$4">
                  {cast.engagement.likes}
                </Text>
              </TouchableOpacity>
            </View>
          </XStack>
        )}
      </YStack>
    </XStack>
  );
};
