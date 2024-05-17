import { ListType } from "@nook/common/types";
import {
  Button,
  Dialog,
  NookButton,
  NookText,
  View,
  XStack,
} from "@nook/app-ui";
import { useCallback, useState } from "react";
import { ListForm } from "./list-form";
import { X } from "@tamagui/lucide-icons";

export const CreateListTrigger = ({ type }: { type?: ListType }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Dialog modal disableRemoveScroll open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <Button
          height="$4"
          width="100%"
          borderRadius="$10"
          fontWeight="600"
          fontSize="$5"
          backgroundColor="$mauve12"
          borderWidth="$0"
          color="$mauve1"
          hoverStyle={{
            backgroundColor: "$mauve11",
            // @ts-ignore
            transition: "all 0.2s ease-in-out",
          }}
          pressStyle={{
            backgroundColor: "$mauve11",
          }}
          disabledStyle={{
            backgroundColor: "$mauve10",
          }}
        >
          Create List
        </Button>
      </Dialog.Trigger>
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
          padding="$2"
          $xs={{ width: "100%", height: "100%" }}
          $platform-web={{
            maxHeight: "75vh",
          }}
        >
          <XStack alignItems="center" justifyContent="space-between">
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
          </XStack>
          <View padding="$2">
            <NookText variant="label">Create List</NookText>
          </View>
          <ListForm allowedType={type} onSubmit={handleSubmit} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
