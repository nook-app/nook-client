import { NookText, Text, View, XStack } from "@nook/ui";
import { useCast } from "../../api/farcaster";
import {
  Heart,
  LayoutGrid,
  MessageSquare,
  Repeat2,
  Share,
} from "@tamagui/lucide-icons";

export const FarcasterCastActions = ({ hash }: { hash: string }) => {
  const { data: cast } = useCast(hash);

  return (
    <XStack alignItems="center" justifyContent="space-between" marginLeft="$-2">
      <XStack gap="$2" alignItems="center">
        <FarcasterReplyActionButton />
        <FarcasterRecastActionButton />
        <FarcasterLikeActionButton />
      </XStack>
      <XStack gap="$2" alignItems="center">
        <FarcasterCustomActionButton />
        <FarcasterShareButton />
      </XStack>
    </XStack>
  );
};

const FarcasterReplyActionButton = () => {
  return (
    <View
      cursor="pointer"
      width="$2.5"
      height="$2.5"
      justifyContent="center"
      alignItems="center"
      borderRadius="$10"
      group
      hoverStyle={{
        // @ts-ignore
        transition: "all 0.2s ease-in-out",
        backgroundColor: "$color3",
      }}
      onPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <MessageSquare
        size={20}
        opacity={0.4}
        $group-hover={{
          color: "$blue9",
          opacity: 1,
        }}
      />
    </View>
  );
};

const FarcasterRecastActionButton = () => {
  return (
    <View
      cursor="pointer"
      width="$2.5"
      height="$2.5"
      justifyContent="center"
      alignItems="center"
      borderRadius="$10"
      group
      hoverStyle={{
        // @ts-ignore
        transition: "all 0.2s ease-in-out",
        backgroundColor: "$color3",
      }}
      onPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Repeat2
        size={24}
        opacity={0.4}
        $group-hover={{
          color: "$green9",
          opacity: 1,
        }}
        strokeWidth={1.75}
      />
    </View>
  );
};

const FarcasterLikeActionButton = () => {
  return (
    <View
      cursor="pointer"
      width="$2.5"
      height="$2.5"
      justifyContent="center"
      alignItems="center"
      borderRadius="$10"
      group
      hoverStyle={{
        // @ts-ignore
        transition: "all 0.2s ease-in-out",
        backgroundColor: "$color3",
      }}
      onPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Heart
        size={20}
        opacity={0.4}
        $group-hover={{
          color: "$red9",
          opacity: 1,
        }}
      />
    </View>
  );
};

const FarcasterCustomActionButton = () => {
  return (
    <View
      cursor="pointer"
      width="$2.5"
      height="$2.5"
      justifyContent="center"
      alignItems="center"
      borderRadius="$10"
      group
      hoverStyle={{
        // @ts-ignore
        transition: "all 0.2s ease-in-out",
        backgroundColor: "$color3",
      }}
      onPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <LayoutGrid
        size={20}
        opacity={0.4}
        $group-hover={{
          color: "$color9",
          opacity: 1,
        }}
      />
    </View>
  );
};

const FarcasterShareButton = () => {
  return (
    <View
      cursor="pointer"
      width="$2.5"
      height="$2.5"
      justifyContent="center"
      alignItems="center"
      borderRadius="$10"
      group
      hoverStyle={{
        // @ts-ignore
        transition: "all 0.2s ease-in-out",
        backgroundColor: "$color3",
      }}
      onPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Share
        size={20}
        opacity={0.4}
        $group-hover={{
          color: "$color9",
          opacity: 1,
        }}
      />
    </View>
  );
};
