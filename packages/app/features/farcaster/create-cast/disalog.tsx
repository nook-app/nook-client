import { X } from "@tamagui/lucide-icons";
import { NookButton, Dialog, XStack, ScrollView } from "@nook/ui";
import { CreateCastEditor } from "./form";
import { CreateCastProvider } from "./context";
import { useCallback, useState } from "react";
import { SubmitCastAddRequest } from "../../../types";
import { useCast } from "../../../api/farcaster";
import { FarcasterCastPreview } from "../../../components/farcaster/casts/cast-preview";

export const CreateCastDialog = ({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState: SubmitCastAddRequest;
}) => {
  const [open, setOpen] = useState(false);

  const handleSubmit = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <CreateCastProvider initialCast={initialState}>
      <Dialog modal disableRemoveScroll open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>{children}</Dialog.Trigger>
        <Dialog.Portal justifyContent="flex-start" paddingTop="$10">
          <Dialog.Overlay
            key="overlay"
            animation="slow"
            opacity={0.75}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <Dialog.Content
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
            backgroundColor="$color2"
            padding="$2"
          >
            <ScrollView maxHeight="75vh">
              <XStack alignItems="center" justifyContent="space-between">
                <Dialog.Close asChild>
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
                </Dialog.Close>
              </XStack>
              {initialState.parentHash && (
                <CreateCastParent parentHash={initialState.parentHash} />
              )}
              <CreateCastEditor onSubmit={handleSubmit} />
            </ScrollView>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </CreateCastProvider>
  );
};

export const CreateCastButton = () => {
  return (
    <CreateCastDialog initialState={{ text: "" }}>
      <NookButton variant="primary">Cast</NookButton>
    </CreateCastDialog>
  );
};

const CreateCastParent = ({ parentHash }: { parentHash: string }) => {
  const { data: cast } = useCast(parentHash);

  if (!cast) return null;

  return <FarcasterCastPreview cast={cast} isConnected />;
};
