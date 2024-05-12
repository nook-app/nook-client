import { NookText, XStack } from "@nook/app-ui";
import { FarcasterCastResponse } from "@nook/common/types";
import { useCastStore } from "../../../store/useCastStore";
import { Link } from "../../link";

export type CastEngagementTypes = "replies" | "likes" | "quotes" | "recasts";

const singular = {
  replies: "reply",
  likes: "like",
  quotes: "quote",
  recasts: "recast",
};

export const FarcasterCastResponseEngagement = ({
  cast,
  types,
}: { cast: FarcasterCastResponse; types: CastEngagementTypes[] }) => {
  return (
    <XStack gap="$2" alignItems="center" flexWrap="wrap">
      {types.map((type) => {
        return (
          <FarcasterCastResponseEngagementItem
            key={type}
            cast={cast}
            type={type}
          />
        );
      })}
    </XStack>
  );
};

const FarcasterCastResponseEngagementItem = ({
  cast,
  type,
}: { cast: FarcasterCastResponse; type: CastEngagementTypes }) => {
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
