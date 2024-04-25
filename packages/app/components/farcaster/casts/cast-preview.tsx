import { NookText, Separator, XStack, YStack } from "@nook/ui";
import { FarcasterCast } from "../../../types";
import {
  FarcasterUserAvatar,
  FarcasterUserTextDisplay,
} from "../users/user-display";
import { formatTimeAgo } from "../../../utils";
import { Embeds } from "../../embeds/Embed";
import { FarcasterCastText } from "./cast-text";

export const FarcasterCastPreview = ({
  cast,
  isConnected,
}: { cast: FarcasterCast; isConnected?: boolean }) => {
  const renderText = cast.text || cast.mentions.length > 0;
  const renderEmbeds = cast.embeds.length > 0 || cast.embedCasts.length > 0;

  return (
    <XStack
      gap="$2"
      transition="all 0.2s ease-in-out"
      hoverStyle={{
        // @ts-ignore
        transition: "all 0.2s ease-in-out",
        backgroundColor: "$color2",
      }}
      paddingHorizontal="$3"
      paddingVertical="$3"
      minHeight="$8"
    >
      <YStack alignItems="center" width="$4" marginTop="$1">
        <FarcasterUserAvatar user={cast.user} size="$4" />
        {isConnected && (
          <Separator
            vertical
            marginBottom="$-8"
            borderWidth="$0.5"
            borderColor="rgba(256, 256, 256, 0.1)"
            zIndex={1}
          />
        )}
      </YStack>
      <YStack flex={1} gap="$2">
        <YStack gap="$1">
          <XStack alignItems="center">
            <FarcasterUserTextDisplay user={cast.user} />
            <NookText muted>{` · ${formatTimeAgo(cast.timestamp)}`}</NookText>
          </XStack>
          {renderText && <FarcasterCastText cast={cast} />}
        </YStack>
        {renderEmbeds && <Embeds cast={cast} />}
      </YStack>
    </XStack>
  );
};
