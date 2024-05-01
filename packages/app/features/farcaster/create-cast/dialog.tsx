import { Pencil, X } from "@tamagui/lucide-icons";
import {
  NookButton,
  Dialog,
  XStack,
  ScrollView,
  NookText,
  View,
} from "@nook/ui";
import { CreateCastEditor } from "./form";
import { CreateCastProvider, useCreateCast } from "./context";
import { useCallback, useEffect, useState } from "react";
import { SubmitCastAddRequest } from "../../../types";
import { useCast } from "../../../api/farcaster";
import { FarcasterCastPreview } from "../../../components/farcaster/casts/cast-preview";
import { useTheme } from "../../../context/theme";
import { submitPendingCastAdd } from "../../../server/farcaster";

export const CreateCastDialog = ({
  children,
  initialState,
}: {
  children?: React.ReactNode;
  initialState: SubmitCastAddRequest;
}) => {
  return (
    <CreateCastProvider initialCast={initialState}>
      <DialogContent initialState={initialState}>{children}</DialogContent>
    </CreateCastProvider>
  );
};

const DialogContent = ({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState: SubmitCastAddRequest;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draftPromptIsOpen, setDraftPromptIsOpen] = useState(false);

  const handleSubmit = useCallback(() => {
    setIsOpen(false);
  }, []);

  const context = useCreateCast();
  const handleIsOpenChange = (isOpen: boolean) => {
    if (isOpen === false && context.activeCastLength > 0) {
      setDraftPromptIsOpen(true);
    } else {
      setIsOpen(isOpen);
    }
  };

  const handleDraftPromptDiscard = () => {
    context.reset();
    setIsOpen(false);
    setDraftPromptIsOpen(false);
  };

  const handleDraftPromptSave = async () => {
    await submitPendingCastAdd(context.activeCast);
    context.reset();
    setIsOpen(false);
    setDraftPromptIsOpen(false);
  };

  return (
    <Dialog
      modal
      disableRemoveScroll
      open={isOpen}
      onOpenChange={handleIsOpenChange}
    >
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
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
        >
          <ScrollView maxHeight="75vh">
            <XStack alignItems="center" justifyContent="space-between">
              <Dialog
                open={draftPromptIsOpen}
                onOpenChange={setDraftPromptIsOpen}
              >
                <Dialog.Trigger>
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
                  />
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay />
                  <Dialog.Content>
                    <NookText>Save draft?</NookText>
                    <NookText>You can save a draft to cast later.</NookText>
                    <NookButton onPress={handleDraftPromptSave}>
                      Save
                    </NookButton>
                    <NookButton onPress={handleDraftPromptDiscard}>
                      Discard
                    </NookButton>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog>
            </XStack>
            {initialState.parentHash && (
              <CreateCastParent parentHash={initialState.parentHash} />
            )}
            <CreateCastEditor onSubmit={handleSubmit} />
          </ScrollView>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};

export const CreateCastButton = () => {
  const { theme } = useTheme();

  return (
    <>
      <View display="flex" $lg={{ display: "none" }}>
        <CreateCastDialog initialState={{ text: "" }}>
          <NookButton
            variant="primary"
            backgroundColor={
              ["light", "dark"].includes(theme) ? "$color12" : "$color9"
            }
          >
            <NookText
              fontWeight="700"
              fontSize="$5"
              color={["light", "dark"].includes(theme) ? "$color1" : "white"}
            >
              Cast
            </NookText>
          </NookButton>
        </CreateCastDialog>
      </View>
      <View display="none" $lg={{ display: "flex" }}>
        <CreateCastDialog initialState={{ text: "" }}>
          <NookButton
            variant="primary"
            width="$5"
            padding="$0"
            backgroundColor={
              ["light", "dark"].includes(theme) ? "$color12" : "$color9"
            }
          >
            <NookText>
              <Pencil
                size={24}
                color={["light", "dark"].includes(theme) ? "$color1" : "white"}
              />
            </NookText>
          </NookButton>
        </CreateCastDialog>
      </View>
    </>
  );
};

const CreateCastParent = ({ parentHash }: { parentHash: string }) => {
  const { data: cast } = useCast(parentHash);

  if (!cast) return null;

  return <FarcasterCastPreview cast={cast} isConnected />;
};
