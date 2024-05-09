import { Dialog, Image } from "@nook/app-ui";
import { X } from "@tamagui/lucide-icons";
import { ReactNode } from "react";

export const ZoomableImage = ({
  uri,
  children,
}: {
  uri?: string;
  children: ReactNode;
}) => {
  if (!uri) return children;

  return (
    <Dialog modal disableRemoveScroll>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="100ms"
          opacity={0.75}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Dialog.Close
          position="absolute"
          top="$2"
          left="$2"
          zIndex={10000000000000}
          cursor="pointer"
        >
          <X size={24} />
        </Dialog.Close>
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
          padding="$0"
          $platform-web={{
            boxShadow: "none",
          }}
          borderRadius="$4"
          overflow="hidden"
        >
          <Image
            source={{ uri }}
            alt=""
            style={{
              maxHeight: "75vh",
              maxWidth: "100vw",
            }}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
