import { Channel, FarcasterUser, ListType } from "@nook/common/types";
import {
  Dialog,
  NookButton,
  NookText,
  ScrollView,
  View,
  XStack,
} from "@nook/app-ui";
import { useCallback } from "react";
import { Scroll, X } from "@tamagui/lucide-icons";
import { ManageListFeed } from "./manage-list";
import { useAuth } from "../../context/auth";

export const ManageListDialog = ({
  user,
  channel,
  open,
  setOpen,
}: {
  user?: FarcasterUser;
  channel?: Channel;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const { session } = useAuth();

  if (!session?.id) return null;

  const handleSubmit = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <Dialog.Portal
        justifyContent="flex-start"
        paddingTop="$10"
        $xs={{ paddingTop: "$0" }}
      >
        <Dialog.Overlay
          key="overlay"
          animation="slow"
          opacity={0.75}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Dialog.Content
          bordered
          elevate
          key="content"
          animateOnly={["transform", "opacity"]}
          animation={[
            "100ms",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          width={600}
          padding="$0"
          $xs={{ width: "100%", height: "100%" }}
          minHeight={200}
          maxHeight={600}
          onPress={(e) => e.stopPropagation()}
        >
          <XStack
            gap="$2"
            paddingHorizontal="$2"
            paddingVertical="$3"
            alignItems="center"
          >
            <NookButton
              size="$3"
              scaleIcon={1.5}
              circular
              icon={X}
              backgroundColor="transparent"
              borderWidth="$0"
              hoverStyle={{
                backgroundColor: "$color4",
                // @ts-ignore
                transition: "all 0.2s ease-in-out",
              }}
              onPress={handleSubmit}
            />
            <NookText variant="label">Add/remove from lists</NookText>
          </XStack>
          <ScrollView>
            <ManageListFeed
              filter={{
                type: user ? ListType.USERS : ListType.PARENT_URLS,
                userId: session.id,
              }}
              user={user}
              channel={channel}
            />
          </ScrollView>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
