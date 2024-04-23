import { NookText, XStack } from "@nook/ui";
import { FarcasterCast } from "../../types";
import { useCast } from "../../api/farcaster";

export type CastEngagementTypes = "replies" | "likes" | "quotes" | "recasts";

const singular = {
  replies: "reply",
  likes: "like",
  quotes: "quote",
  recasts: "recast",
};

export const FarcasterCastEngagement = ({
  hash,
  types,
}: { hash: string; types: CastEngagementTypes[] }) => {
  const { data: cast } = useCast(hash);

  return (
    <XStack gap="$2" alignItems="center">
      {types.map((type) => {
        return (
          <FarcasterCastEngagementItem key={type} cast={cast} type={type} />
        );
      })}
    </XStack>
  );
};

const FarcasterCastEngagementItem = ({
  cast,
  type,
}: { cast: FarcasterCast; type: CastEngagementTypes }) => {
  const amount = cast.engagement[type] || 0;
  if (amount === 0) return null;

  return (
    <XStack gap="$1.5" alignItems="center">
      <NookText fontWeight="500">{amount}</NookText>
      <NookText muted>{amount === 1 ? singular[type] : type}</NookText>
    </XStack>
  );
};
