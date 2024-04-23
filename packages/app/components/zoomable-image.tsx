import { Dialog, Image, View } from "@nook/ui";
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
          backgroundColor="transparent"
          padding="$0"
          $platform-web={{
            boxShadow: "none",
          }}
          borderRadius="$4"
          overflow="hidden"
        >
          <img
            src={uri}
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
