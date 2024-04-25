import { NookText, XStack } from "@nook/ui";
import {
  FarcasterCast,
  FarcasterCastEngagement as FarcasterCastEngagementType,
} from "../../../types";
import { Link } from "solito/link";

export type CastEngagementTypes = "replies" | "likes" | "quotes" | "recasts";

const singular = {
  replies: "reply",
  likes: "like",
  quotes: "quote",
  recasts: "recast",
};

export const FarcasterCastEngagement = ({
  hash,
  engagement,
  types,
}: {
  hash: string;
  engagement: FarcasterCastEngagementType;
  types: CastEngagementTypes[];
}) => {
  return (
    <XStack gap="$2" alignItems="center" flexWrap="wrap">
      {types.map((type) => {
        return (
          <FarcasterCastEngagementItem
            key={type}
            hash={hash}
            amount={engagement[type]}
            type={type}
          />
        );
      })}
    </XStack>
  );
};

const FarcasterCastEngagementItem = ({
  hash,
  amount,
  type,
}: { hash: string; amount: number; type: CastEngagementTypes }) => {
  if (amount === 0) return null;

  switch (type) {
    case "likes":
      return (
        <Link href={`/casts/${hash}/likes`}>
          <XStack gap="$1.5" alignItems="center">
            <NookText fontWeight="500">{amount}</NookText>
            <NookText muted>{amount === 1 ? singular[type] : type}</NookText>
          </XStack>
        </Link>
      );
    case "quotes":
      return (
        <Link href={`/casts/${hash}/quotes`}>
          <XStack gap="$1.5" alignItems="center">
            <NookText fontWeight="500">{amount}</NookText>
            <NookText muted>{amount === 1 ? singular[type] : type}</NookText>
          </XStack>
        </Link>
      );
    case "recasts":
      return (
        <Link href={`/casts/${hash}/recasts`}>
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
