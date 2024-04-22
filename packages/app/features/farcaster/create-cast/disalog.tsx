import { X } from "@tamagui/lucide-icons";
import { NookButton, Dialog, XStack, YStack } from "@nook/ui";
import { CreateCastEditor } from "./form";
import { CreateCastProvider } from "./context";

export const CreateCastDialog = () => {
  return (
    <CreateCastProvider initialCast={{ text: "" }}>
      <Dialog modal>
        <Dialog.Trigger asChild>
          <NookButton variant="primary">Post</NookButton>
        </Dialog.Trigger>
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
          >
            <YStack>
              <XStack alignItems="center" justifyContent="space-between">
                <Dialog.Close asChild>
                  <NookButton
                    variant="ghost"
                    size="$2"
                    scaleIcon={1.5}
                    circular
                    icon={X}
                  />
                </Dialog.Close>
              </XStack>
              <CreateCastEditor />
            </YStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </CreateCastProvider>
  );
};
