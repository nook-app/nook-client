import { Separator, Text, View, XStack, YStack, useTheme } from "tamagui";
import { UserAvatar } from "@/components/user/UserAvatar";
import { FarcasterCastText } from "@/components/farcaster/FarcasterCastText";
import { UserDisplay } from "../user/UserDisplay";
import { MessageSquare } from "@tamagui/lucide-icons";
import { formatTimeAgo } from "@/utils";
import { ChannelDisplay } from "../channel/ChannelDisplay";
import { FarcasterCastResponseWithContext } from "@nook/common/types";
import { Embed } from "../embeds/Embed";
import { EmbedCast } from "../embeds/EmbedCast";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { FarcasterCastLikeButton } from "./FarcasterCastLikeButton";
import { FarcasterCastRecastButton } from "./FarcasterCastRecastButton";

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
        <UserAvatar userId={cast.entity.id} />
        {isParent && <Separator vertical />}
      </View>
      <YStack flex={1} gap="$1" paddingBottom={isParent ? "$2" : "$0"}>
        <View alignSelf="flex-start">
          <UserDisplay userId={cast.entity.id} />
        </View>
        <XStack alignItems="center" gap="$1.5">
          <Text color="$gray11">{formatTimeAgo(cast.timestamp)}</Text>
          {showParentContext && cast.parent?.entity && (
            <>
              <Text color="$gray11">replying to</Text>
              <UserDisplay userId={cast.parent.entity.id} hideDisplayName />
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
            <FarcasterCastRecastButton hash={cast.hash} withAmount />
            <FarcasterCastLikeButton hash={cast.hash} withAmount />
          </XStack>
        )}
      </YStack>
    </XStack>
  );
};
