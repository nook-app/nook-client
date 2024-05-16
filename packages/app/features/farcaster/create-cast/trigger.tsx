import {
  FarcasterCastResponse,
  SubmitCastAddRequest,
} from "@nook/common/types";
import { CreateCastDialog } from "./dialog";
import { ReactNode } from "react";
import { Dialog, Popover, View, useTheme } from "@nook/app-ui";
import { useAuth } from "../../../context/auth";
import {
  MessageSquare,
  MessageSquareQuote,
  Repeat2,
} from "@tamagui/lucide-icons";
import { Menu } from "../../../components/menu/menu";
import { MenuItem } from "../../../components/menu/menu-item";
import { useRecastCast } from "../../../hooks/useRecastCast";
import { useMenu } from "../../../components/menu/context";

export const CreateCastTrigger = ({
  children,
  initialState,
  noTrigger,
}: {
  children: ReactNode;
  initialState: SubmitCastAddRequest;
  noTrigger?: boolean;
}) => {
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
      <CreateCastDialog initialState={initialState} noTrigger={noTrigger}>
        {children}
      </CreateCastDialog>
    </View>
  );
};

export const CreateCastReplyTrigger = ({
  cast,
}: {
  cast: FarcasterCastResponse;
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
    </CreateCastTrigger>
  );
};

export const CreateCastQuoteTrigger = ({
  cast,
}: {
  cast: FarcasterCastResponse;
}) => {
  const theme = useTheme();
  const { isRecasted } = useRecastCast(cast);
  return (
    <CreateCastTrigger
      initialState={{
        text: "",
        castEmbedHash: cast.hash,
        castEmbedFid: cast.user.fid,
      }}
      noTrigger
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
        <CreateCastQuoteTriggerMenuItem cast={cast} />
      </Menu>
    </CreateCastTrigger>
  );
};

const CreateCastQuoteTriggerMenuItem = ({
  cast,
}: { cast: FarcasterCastResponse }) => {
  const { close } = useMenu();
  const { recastCast, unrecastCast, isRecasted } = useRecastCast(cast);
  return (
    <>
      <MenuItem
        Icon={Repeat2}
        title={isRecasted ? "Unrecast" : "Recast"}
        onPress={() => {
          close();
          if (isRecasted) {
            unrecastCast();
          } else {
            recastCast();
          }
        }}
      />
      <Dialog.Trigger asChild>
        <MenuItem Icon={MessageSquareQuote} title="Quote" onPress={close} />
      </Dialog.Trigger>
    </>
  );
};
