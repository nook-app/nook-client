import { Text, XStack, YStack } from "@nook/app-ui";
import {
  SimpleHashCollection,
  SimplehashNftCollection,
} from "@nook/common/types";
import { CdnAvatar } from "../../components/cdn-avatar";
import { ChevronRight } from "@tamagui/lucide-icons";
import { formatTimeAgo } from "../../utils";
import { Link } from "../../components/link";

export const NftCollectionDisplay = ({
  collection,
}: { collection: SimplehashNftCollection }) => {
  return (
    <Link href={`/collections/${collection.collection_id}`} touchable>
      <XStack
        marginHorizontal="$2"
        marginVertical="$1.5"
        padding="$2.5"
        justifyContent="space-between"
        alignItems="center"
        backgroundColor="$color2"
        borderRadius="$4"
      >
        <XStack alignItems="center" gap="$3" flexShrink={1}>
          <CdnAvatar
            src={collection.collection_details.image_url}
            size="$4"
            borderRadius="$4"
          />
          <YStack flexShrink={1}>
            <Text fontWeight="600" fontSize="$5" numberOfLines={1}>
              {collection.collection_details.name}
            </Text>
            <Text color="$mauve11">{`${collection.distinct_nfts_owned} item${
              collection.distinct_nfts_owned > 1 ? "s" : ""
            } since ${formatTimeAgo(
              new Date(collection.last_acquired_date).getTime(),
              true,
            )}`}</Text>
          </YStack>
        </XStack>
        <ChevronRight />
      </XStack>
    </Link>
  );
};

export const NftCreatedCollectionDisplay = ({
  collection,
}: { collection: SimpleHashCollection }) => {
  return (
    <Link href={`/collections/${collection.collection_id}`} touchable>
      <XStack
        marginHorizontal="$2"
        marginVertical="$1.5"
        padding="$2.5"
        justifyContent="space-between"
        alignItems="center"
        backgroundColor="$color2"
        borderRadius="$4"
      >
        <XStack alignItems="center" gap="$3" flexShrink={1}>
          <CdnAvatar src={collection.image_url} size="$4" borderRadius="$4" />
          <YStack flexShrink={1}>
            <Text fontWeight="600" fontSize="$5" numberOfLines={1}>
              {collection.name}
            </Text>
            <Text color="$mauve11">
              {collection.deployment_date
                ? `on ${formatTimeAgo(
                    new Date(collection.deployment_date).getTime(),
                    true,
                  )}`
                : ""}
            </Text>
          </YStack>
        </XStack>
        <ChevronRight />
      </XStack>
    </Link>
  );
};
