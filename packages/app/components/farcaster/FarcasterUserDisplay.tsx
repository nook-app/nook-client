import { FarcasterUser } from "../../types";
import { Text, XStack, YStack } from "@nook/ui";
import { FarcasterPowerBadge } from "./FarcasterPowerBadge";

export const FarcasterUserDisplay = ({
  user,
  orientation = "horizontal",
}: { user: FarcasterUser; orientation?: "horizontal" | "vertical" }) => {
  const Stack = orientation === "horizontal" ? XStack : YStack;
  return (
    <Stack
      gap="$1"
      alignItems={orientation === "horizontal" ? "center" : "flex-start"}
      paddingRight="$2"
    >
      <XStack gap="$1.5" alignItems="center">
        <Text
          fontWeight="500"
          color="$mauve12"
          flexShrink={1}
          numberOfLines={1}
        >
          {`${user.displayName || user.username || `!${user.fid}`} `}
        </Text>
        <FarcasterPowerBadge badge={user.badges?.powerBadge ?? false} />
      </XStack>
      <Text fontWeight="400" color="$mauve11" flexShrink={1} numberOfLines={1}>
        {user.username ? ` @${user.username}` : ` !${user.fid}`}
      </Text>
    </Stack>
  );
};
