import {
  AlertDialog,
  NookButton,
  NookText,
  Spinner,
  View,
  XStack,
  YStack,
} from "@nook/ui";
import QRCode from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../context/auth";
import { X } from "@tamagui/lucide-icons";
import { Link } from "solito/link";

export const EnableSignerDialog = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { session, signer, refreshSigner } = useAuth();
  const pollingRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (signer?.state === "completed") {
      setIsOpen(false);
    }
  }, [signer]);

  useEffect(() => {
    const pollRefresh = async () => {
      const state = await refreshSigner();
      if (state === "completed") {
        return;
      }
    };

    if (isOpen) {
      pollingRef.current = setInterval(pollRefresh, 2000);
    } else {
      clearInterval(pollingRef.current);
    }

    return () => clearInterval(pollingRef.current);
  }, [isOpen, refreshSigner]);

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
      <AlertDialog.Portal
        justifyContent="flex-start"
        paddingTop="$10"
        $xs={{ paddingTop: "$0" }}
      >
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
          <YStack padding="$3" alignItems="center" gap="$3">
            <YStack alignItems="center">
              <AlertDialog.Title>Enable Nook</AlertDialog.Title>
              <AlertDialog.Description textAlign="center">
                Nook needs permissions from you to be able to perform write
                actions on Farcaster. Scan the QR code with your mobile device
                to be taken to Warpcast.
              </AlertDialog.Description>
            </YStack>
            {!signer && <Spinner color="$color111" />}
            {signer && <QRCode value={signer.deeplinkUrl} size={256} />}
            {signer && (
              <Link href={signer.deeplinkUrl}>
                <NookText muted fontWeight="600" fontSize="$4">
                  Open Link
                </NookText>
              </Link>
            )}
          </YStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
};
