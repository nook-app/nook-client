import { View } from "@nook/ui";
import {
  Heart,
  LayoutGrid,
  MessageSquare,
  Repeat2,
  Share,
} from "@tamagui/lucide-icons";

export const FarcasterReplyActionButton = () => {
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

export const FarcasterRecastActionButton = () => {
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

export const FarcasterLikeActionButton = () => {
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

export const FarcasterCustomActionButton = () => {
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

export const FarcasterShareButton = () => {
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
