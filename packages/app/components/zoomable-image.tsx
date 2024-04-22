import { Dialog, Image, View } from "@nook/ui";
import { ReactNode } from "react";

export const ZoomableImage = ({
  uri,
  children,
  aspectRatio,
}: {
  uri?: string;
  children: ReactNode;
  aspectRatio: number;
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
          height={600}
          width={600 * aspectRatio}
          borderRadius="$4"
          overflow="hidden"
        >
          <Image
            source={{ uri }}
            resizeMode="contain"
            aspectRatio={aspectRatio}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
