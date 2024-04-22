import { FarcasterUser } from "../../types";
import { NookText, View, XStack, YStack } from "@nook/ui";
import { FarcasterPowerBadge } from "./power-badge";
import { CdnAvatar } from "../cdn-avatar";
import { Link } from "solito/link";

export const FarcasterUserTextDisplay = ({
  user,
  orientation = "horizontal",
}: {
  user: FarcasterUser;
  orientation?: "horizontal" | "vertical";
}) => {
  const Stack = orientation === "horizontal" ? XStack : YStack;
  return (
    <View
      onPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Link href={`/${user.username}`}>
        <Stack
          gap={orientation === "horizontal" ? "$1.5" : "$1"}
          alignItems={orientation === "horizontal" ? "center" : "flex-start"}
          paddingRight="$2"
        >
          <XStack gap="$1.5" alignItems="center">
            <NookText fontWeight="600" flexShrink={1} numberOfLines={1}>
              {`${user.displayName || user.username || `!${user.fid}`} `}
            </NookText>
            <FarcasterPowerBadge badge={user.badges?.powerBadge ?? false} />
          </XStack>
          <NookText muted flexShrink={1} numberOfLines={1}>
            {user.username ? ` @${user.username}` : ` !${user.fid}`}
          </NookText>
        </Stack>
      </Link>
    </View>
  );
};

export const FarcasterUserDisplay = ({ user }: { user: FarcasterUser }) => (
  <XStack
    gap="$3"
    alignItems="center"
    onPress={(e) => {
      e.preventDefault();
      e.stopPropagation();
    }}
  >
    <Link href={`/${user.username}`}>
      <CdnAvatar src={user.pfp} size="$4" />
    </Link>
    <FarcasterUserTextDisplay user={user} orientation="vertical" />
  </XStack>
);
