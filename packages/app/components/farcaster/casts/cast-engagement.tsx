import { NookText, XStack } from "@nook/ui";
import { FarcasterCast } from "@nook/common/types";
import { Link } from "solito/link";
import { useCastStore } from "../../../store/useCastStore";

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
    <XStack gap="$2" alignItems="center" flexWrap="wrap">
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
  const storeCast = useCastStore((state) => state.casts[cast.hash]);

  const amount = storeCast?.engagement[type] ?? cast.engagement[type];
  if (amount === 0) return null;

  switch (type) {
    case "likes":
      return (
        <Link href={`/casts/${cast.hash}/likes`}>
          <XStack gap="$1.5" alignItems="center">
            <NookText fontWeight="500">{amount}</NookText>
            <NookText muted>{amount === 1 ? singular[type] : type}</NookText>
          </XStack>
        </Link>
      );
    case "quotes":
      return (
        <Link href={`/casts/${cast.hash}/quotes`}>
          <XStack gap="$1.5" alignItems="center">
            <NookText fontWeight="500">{amount}</NookText>
            <NookText muted>{amount === 1 ? singular[type] : type}</NookText>
          </XStack>
        </Link>
      );
    case "recasts":
      return (
        <Link href={`/casts/${cast.hash}/recasts`}>
          <XStack gap="$1.5" alignItems="center">
            <NookText fontWeight="500">{amount}</NookText>
            <NookText muted>{amount === 1 ? singular[type] : type}</NookText>
          </XStack>
        </Link>
      );
    default:
      return (
        <XStack gap="$1.5" alignItems="center">
          <NookText fontWeight="500">{amount}</NookText>
          <NookText muted>{amount === 1 ? singular[type] : type}</NookText>
        </XStack>
      );
  }
};
