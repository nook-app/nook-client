import { AlertDialog, NookButton, XStack } from "@nook/app-ui";
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/auth";
import { X } from "@tamagui/lucide-icons";
import { EnableSignerContent } from "./content";

export const EnableSignerDialog = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { session, signer } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (signer?.state === "completed") {
      setIsOpen(false);
    }
  }, [signer]);

  if (!session || signer?.state === "completed") {
    return children;
  }

  return (
    <AlertDialog
      modal
      disableRemoveScroll
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          key="overlay"
          animation="slow"
          opacity={0.75}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <AlertDialog.Content
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
          backgroundColor="$color2"
          $xs={{ width: "100%", height: "100%" }}
          padding="$2"
        >
          <XStack alignItems="center" justifyContent="space-between">
            <AlertDialog.Cancel asChild>
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
            </AlertDialog.Cancel>
          </XStack>
          <EnableSignerContent isOpen={isOpen} />
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
};
