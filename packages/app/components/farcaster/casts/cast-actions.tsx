import { Dialog, Popover, View, useTheme } from "@nook/app-ui";
import {
  Heart,
  Image,
  MessageSquare,
  MessageSquareQuote,
  Repeat2,
  Share,
} from "@tamagui/lucide-icons";
import { CreateCastDialog } from "../../../features/farcaster/create-cast/disalog";
import { FarcasterCastResponse } from "@nook/common/types";
import { useLikeCast } from "../../../hooks/useLikeCast";
import { useRecastCast } from "../../../hooks/useRecastCast";
import { EnableSignerDialog } from "../../../features/farcaster/enable-signer/dialog";
import { useAuth } from "../../../context/auth";
import { Menu } from "../../menu/menu";
import { MenuItem } from "../../menu/menu-item";
import { CopyLink, OpenLink } from "../../menu/menu-actions";

export const FarcasterReplyActionButton = ({
  cast,
}: { cast: FarcasterCastResponse }) => {
  const { session, login } = useAuth();
  return (
    <View
      onPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!session) {
          login();
          return;
        }
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
            opacity={0.75}
            color="$mauve11"
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
}: { cast: FarcasterCastResponse }) => {
  const theme = useTheme();
  const { recastCast, unrecastCast, isRecasted } = useRecastCast(cast);
  const { session, login } = useAuth();

  if (isRecasted || !session) {
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
          if (!session) {
            login();
            return;
          }
          unrecastCast();
        }}
      >
        <Repeat2
          size={24}
          opacity={isRecasted ? 1 : 0.75}
          $group-hover={{
            color: "$green9",
            opacity: 1,
          }}
          strokeWidth={isRecasted ? 2.5 : 1.75}
          color={isRecasted ? theme.green9.val : "$mauve11"}
        />
      </View>
    );
  }

  return (
    <CreateCastDialog
      initialState={{
        text: "",
        castEmbedHash: cast.hash,
        castEmbedFid: cast.user.fid,
      }}
    >
      <Menu
        trigger={
          <Popover.Trigger asChild>
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
                opacity={isRecasted ? 1 : 0.75}
                $group-hover={{
                  color: "$green9",
                  opacity: 1,
                }}
                strokeWidth={isRecasted ? 2.5 : 1.75}
                color={isRecasted ? theme.green9.val : "$mauve11"}
              />
            </View>
          </Popover.Trigger>
        }
      >
        <MenuItem
          Icon={Repeat2}
          title="Recast"
          onPress={() => {
            recastCast();
          }}
        />
        <FarcasterQuoteMenuItem />
      </Menu>
    </CreateCastDialog>
  );
};

const FarcasterQuoteMenuItem = () => {
  return (
    <Dialog.Trigger>
      <MenuItem Icon={MessageSquareQuote} title="Quote" />
    </Dialog.Trigger>
  );
};

export const FarcasterLikeActionButton = ({
  cast,
}: { cast: FarcasterCastResponse }) => {
  const theme = useTheme();
  const { likeCast, unlikeCast, isLiked } = useLikeCast(cast);
  const { session, login } = useAuth();
  return (
    <EnableSignerDialog>
      <View
        animation="bouncy"
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
        pressStyle={{
          scale: 1.25,
        }}
        onPress={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!session) {
            login();
            return;
          }
          if (isLiked) {
            unlikeCast();
          } else {
            likeCast();
          }
        }}
      >
        <Heart
          size={20}
          opacity={isLiked ? 1 : 0.75}
          $group-hover={{
            color: "$red9",
            opacity: 1,
          }}
          color={isLiked ? theme.red9.val : "$mauve11"}
          fill={isLiked ? theme.red9.val : "transparent"}
        />
      </View>
    </EnableSignerDialog>
  );
};

export const FarcasterShareButton = ({
  cast,
}: { cast: FarcasterCastResponse }) => {
  return (
    <Menu
      trigger={
        <Popover.Trigger asChild>
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
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Share
              size={20}
              opacity={0.75}
              color="$mauve11"
              $group-hover={{
                color: "$color9",
                opacity: 1,
              }}
            />
          </View>
        </Popover.Trigger>
      }
    >
      <CopyLink link={`https://nook.social/casts/${cast.hash}`} />
      <OpenLink
        link={`https://client.warpcast.com/v2/cast-image?castHash=${cast.hash}`}
        Icon={Image}
        title="Share image"
      />
    </Menu>
  );
};
