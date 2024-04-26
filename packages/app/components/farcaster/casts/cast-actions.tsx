import {
  Dialog,
  Image,
  ListItem,
  NookText,
  View,
  YGroup,
  useTheme,
  useToastController,
} from "@nook/ui";
import {
  Heart,
  Image as ImageIcon,
  LayoutGrid,
  Link,
  MessageSquare,
  MessageSquareQuote,
  Repeat2,
  Share,
} from "@tamagui/lucide-icons";
import {
  CreateCastDialog,
  CreateCastDialogTest,
} from "../../../features/farcaster/create-cast/disalog";
import { FarcasterCast } from "../../../types";
import { useLikeCast } from "../../../hooks/useLikeCast";
import { useRecastCast } from "../../../hooks/useRecastCast";
import { Dispatch, SetStateAction, useState } from "react";
import { KebabMenu, KebabMenuItem } from "../../kebab-menu";

export const FarcasterReplyActionButton = ({
  cast,
}: { cast: FarcasterCast }) => {
  return (
    <View
      onPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <CreateCastDialog
        initialState={{
          text: "",
          parentFid: cast.user.fid,
          parentHash: cast.hash,
        }}
      >
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
      </CreateCastDialog>
    </View>
  );
};

export const FarcasterRecastActionButton = ({
  cast,
  setRecasts,
}: { cast: FarcasterCast; setRecasts?: Dispatch<SetStateAction<number>> }) => {
  const theme = useTheme();
  const { recastCast, unrecastCast, isRecasted } = useRecastCast(cast);

  if (isRecasted) {
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
          unrecastCast({});
          setRecasts?.((prev) => prev - 1);
        }}
      >
        <Repeat2
          size={24}
          opacity={isRecasted ? 1 : 0.4}
          $group-hover={{
            color: "$green9",
            opacity: 1,
          }}
          strokeWidth={isRecasted ? 2.5 : 1.75}
          color={isRecasted ? theme.green9.val : undefined}
        />
      </View>
    );
  }

  return (
    <CreateCastDialogTest
      initialState={{
        text: "",
        castEmbedHash: cast.hash,
        castEmbedFid: cast.user.fid,
      }}
    >
      <KebabMenu
        trigger={
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
          >
            <Repeat2
              size={24}
              opacity={isRecasted ? 1 : 0.4}
              $group-hover={{
                color: "$green9",
                opacity: 1,
              }}
              strokeWidth={isRecasted ? 2.5 : 1.75}
              color={isRecasted ? theme.green9.val : undefined}
            />
          </View>
        }
      >
        <KebabMenuItem
          Icon={Repeat2}
          title="Recast"
          onPress={() => {
            recastCast({});
            setRecasts?.((prev) => prev + 1);
          }}
        />
        <FarcasterQuoteMenuItem cast={cast} />
      </KebabMenu>
    </CreateCastDialogTest>
  );
};

const FarcasterQuoteMenuItem = ({
  cast,
  closeMenu,
}: { cast: FarcasterCast; closeMenu?: () => void }) => {
  return (
    <Dialog.Trigger>
      <KebabMenuItem
        Icon={MessageSquareQuote}
        title="Quote"
        closeMenu={closeMenu}
      />
    </Dialog.Trigger>
  );
};

export const FarcasterLikeActionButton = ({
  cast,
  setLikes,
}: { cast: FarcasterCast; setLikes?: Dispatch<SetStateAction<number>> }) => {
  const theme = useTheme();
  const { likeCast, unlikeCast, isLiked } = useLikeCast(cast);
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
        if (isLiked) {
          unlikeCast({});
          setLikes?.((prev) => prev - 1);
        } else {
          likeCast({});
          setLikes?.((prev) => prev + 1);
        }
      }}
    >
      <Heart
        size={20}
        opacity={isLiked ? 1 : 0.4}
        $group-hover={{
          color: "$red9",
          opacity: 1,
        }}
        color={isLiked ? theme.red9.val : undefined}
        fill={isLiked ? theme.red9.val : "transparent"}
      />
    </View>
  );
};

export const FarcasterShareButton = ({ cast }: { cast: FarcasterCast }) => {
  const toast = useToastController();
  return (
    <KebabMenu
      trigger={
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
      }
    >
      <KebabMenuItem
        Icon={Link}
        title="Copy link"
        onPress={() => {
          navigator.clipboard.writeText(
            `https://nook.social/casts/${cast.hash}`,
          );
          toast.show("Link copied to clipboard");
        }}
      />
      <KebabMenuItem
        Icon={ImageIcon}
        title="Share image"
        onPress={() =>
          window.open(
            `https://client.warpcast.com/v2/cast-image?castHash=${cast.hash}`,
          )
        }
      />
      <KebabMenuItem
        Icon={
          <Image source={{ uri: "/warpcast.svg" }} width={14} height={14} />
        }
        title="View on Warpcast"
        onPress={() =>
          window.open(`https://warpcast.com/~/conversations/${cast.hash}`)
        }
      />
    </KebabMenu>
  );
};

export const FarcasterCustomActionButton = ({
  cast,
}: { cast: FarcasterCast }) => {
  return null;
  // return (
  //   <View
  //     cursor="pointer"
  //     width="$2.5"
  //     height="$2.5"
  //     justifyContent="center"
  //     alignItems="center"
  //     borderRadius="$10"
  //     group
  //     hoverStyle={{
  //       // @ts-ignore
  //       transition: "all 0.2s ease-in-out",
  //       backgroundColor: "$color3",
  //     }}
  //     onPress={(e) => {
  //       e.preventDefault();
  //       e.stopPropagation();
  //     }}
  //   >
  //     <LayoutGrid
  //       size={20}
  //       opacity={0.4}
  //       $group-hover={{
  //         color: "$color9",
  //         opacity: 1,
  //       }}
  //     />
  //   </View>
  // );
};
