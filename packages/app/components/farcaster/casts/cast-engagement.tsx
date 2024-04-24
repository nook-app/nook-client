import { NookText, XStack } from "@nook/ui";
import { FarcasterCast } from "../../../types";
import { Link } from "solito/link";

export type CastEngagementTypes = "replies" | "likes" | "quotes" | "recasts";

const singular = {
  replies: "reply",
  likes: "like",
  quotes: "quote",
  recasts: "recast",
};

export const FarcasterCastEngagement = ({
  cast,
  types,
}: { cast: FarcasterCast; types: CastEngagementTypes[] }) => {
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

  const Component = (
    <XStack gap="$1.5" alignItems="center">
      <NookText fontWeight="500">{amount}</NookText>
      <NookText muted>{amount === 1 ? singular[type] : type}</NookText>
    </XStack>
  );

  switch (type) {
    case "likes":
      return <Link href={`/casts/${cast.hash}/likes`}>{Component}</Link>;
    case "quotes":
      return <Link href={`/casts/${cast.hash}/quotes`}>{Component}</Link>;
    case "recasts":
      return <Link href={`/casts/${cast.hash}/recasts`}>{Component}</Link>;
    default:
      return Component;
  }
};
