import { NookText, View } from "@nook/ui";
import { FarcasterUser } from "../../../types";

export const UserFollowBadge = ({ user }: { user: FarcasterUser }) => {
  let badge: string | undefined;
  if (user.context?.following && user.context?.followers) {
    badge = "Mutuals";
  } else if (user.context?.following) {
    badge = "Following";
  } else if (user.context?.followers) {
    badge = "Follows you";
  }

  if (!badge) return null;

  return (
    <View
      paddingVertical="$1"
      paddingHorizontal="$2"
      borderRadius="$2"
      backgroundColor="$color3"
    >
      <NookText fontSize="$2" fontWeight="500">
        {badge}
      </NookText>
    </View>
  );
};
