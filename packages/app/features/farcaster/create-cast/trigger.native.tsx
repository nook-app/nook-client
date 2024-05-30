import { FarcasterCastV1, SubmitCastAddRequest } from "@nook/common/types";
import { ReactNode } from "react";
import { Popover, View, useTheme } from "@nook/app-ui";
import {
  MessageSquare,
  MessageSquareQuote,
  Repeat2,
} from "@tamagui/lucide-icons";
import { Link } from "../../../components/link";
import { haptics } from "../../../utils/haptics";
import { Menu } from "../../../components/menu/menu";
import { MenuItem } from "../../../components/menu/menu-item";
import { useRecastCast } from "../../../hooks/useRecastCast";
import { useMenu } from "../../../components/menu/context";
import { useAuth } from "../../../context/auth";
import { router } from "expo-router";

export const CreateCastTrigger = ({
  children,
  initialState,
  noTrigger,
}: {
  children: ReactNode;
  initialState: SubmitCastAddRequest;
  noTrigger?: boolean;
}) => {
  const { signer } = useAuth();
  return (
    <Link
      href={
        signer?.state === "completed"
          ? {
              pathname: "/create/cast",
              params: initialState,
            }
          : {
              pathname: "/enable-signer",
            }
      }
      absolute
      onPress={() => haptics.selection()}
    >
      {children}
    </Link>
  );
};

export const CreateCastReplyTrigger = ({
  cast,
}: {
  cast: FarcasterCastV1;
}) => {
  return (
    <CreateCastTrigger
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
      >
        <MessageSquare size={20} opacity={0.75} color="$mauve11" />
      </View>
    </CreateCastTrigger>
  );
};

export const CreateCastQuoteTrigger = ({
  cast,
}: {
  cast: FarcasterCastV1;
}) => {
  const { isRecasted } = useRecastCast(cast);
  const theme = useTheme();
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
      <CreateCastQuoteTriggerMenuItem cast={cast} />
    </Menu>
  );
};

const CreateCastQuoteTriggerMenuItem = ({
  cast,
}: { cast: FarcasterCastV1 }) => {
  const { recastCast, unrecastCast, isRecasted } = useRecastCast(cast);
  const { signer } = useAuth();
  const { close } = useMenu();

  return (
    <>
      <MenuItem
        Icon={Repeat2}
        title={isRecasted ? "Unrecast" : "Recast"}
        onPress={() => {
          close();
          if (signer?.state === "completed") {
            isRecasted ? unrecastCast() : recastCast();
          } else {
            haptics.selection();
            router.push("/enable-signer");
          }
        }}
      />
      <Link
        href={
          signer?.state === "completed"
            ? {
                pathname: "/create/cast",
                params: {
                  text: "",
                  castEmbedHash: cast.hash,
                  castEmbedFid: cast.user.fid,
                },
              }
            : {
                pathname: "/enable-signer",
              }
        }
        absolute
        onPress={() => {
          haptics.selection();
          close();
        }}
      >
        <MenuItem Icon={MessageSquareQuote} title="Quote" />
      </Link>
    </>
  );
};
