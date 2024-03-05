import { Separator, Text, View, XStack, YStack, useTheme } from "tamagui";
import { EntityAvatar } from "@/components/entity/EntityAvatar";
import { FarcasterCastText } from "@/components/farcaster/FarcasterCastText";
import { EntityDisplay } from "../entity/EntityDisplay";
import { Heart, MessageSquare, RefreshCw } from "@tamagui/lucide-icons";
import { formatTimeAgo } from "@/utils";
import { ChannelDisplay } from "../channel/ChannelDisplay";
import { FarcasterCastResponseWithContext } from "@nook/common/types";
import { Embed } from "../embeds/Embed";
import { EmbedCast } from "../embeds/EmbedCast";

export const FarcasterCastCompact = ({
  cast,
  isParent,
}: { cast: FarcasterCastResponseWithContext; isParent?: boolean }) => {
  const theme = useTheme();
  const showParentContext = isParent && !!cast.parent;
  const isTrue = false;

  return (
    <XStack gap="$2">
      <View width="$3.5" alignItems="center">
        <EntityAvatar entityId={cast.entity.id} />
        {isParent && <Separator vertical />}
      </View>
      <YStack flex={1} gap="$1" paddingBottom={isParent ? "$2" : "$0"}>
        <View alignSelf="flex-start">
          <EntityDisplay entityId={cast.entity.id} />
        </View>
        <XStack alignItems="center" gap="$1.5">
          <Text color="$gray11">{formatTimeAgo(cast.timestamp)}</Text>
          {showParentContext && cast.parent?.entity && (
            <>
              <Text color="$gray11">replying to</Text>
              <EntityDisplay entityId={cast.parent.entity.id} hideDisplayName />
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
              <RefreshCw
                size={16}
                color={isTrue ? "$green9" : "$gray10"}
                fill={isTrue ? theme.$green9.val : theme.$background.val}
              />
              <Text color="$gray10" fontSize="$4">
                {cast.engagement.recasts}
              </Text>
            </View>
            <View flexDirection="row" alignItems="center" gap="$1.5" width="$3">
              <Heart
                size={16}
                color={isTrue ? "$red9" : "$gray10"}
                fill={isTrue ? theme.$red9.val : theme.$background.val}
              />
              <Text color="$gray10" fontSize="$4">
                {cast.engagement.likes}
              </Text>
            </View>
          </XStack>
        )}
      </YStack>
    </XStack>
  );
};
