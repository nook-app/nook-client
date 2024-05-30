import { NookText, View } from "@nook/app-ui";
import { FarcasterUserV1 } from "@nook/common/types";

export const UserFollowBadge = ({ user }: { user: FarcasterUserV1 }) => {
  let badge: string | undefined;
  if (user.context?.following && user.context?.followers) {
    badge = "Mutuals";
  } else if (user.context?.followers) {
    badge = "Follows you";
  }

  if (!badge) return null;

  return (
    <View
      paddingVertical="$1"
      paddingHorizontal="$2"
      borderRadius="$2"
      backgroundColor="$color5"
    >
      <NookText fontSize="$2" fontWeight="500">
        {badge}
      </NookText>
    </View>
  );
};
