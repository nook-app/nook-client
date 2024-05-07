import { Pencil, X } from "@tamagui/lucide-icons";
import {
  NookButton,
  Dialog,
  XStack,
  ScrollView,
  NookText,
  View,
} from "@nook/app-ui";
import { CreateCastEditor } from "./form";
import { CreateCastProvider } from "./context";
import { useCallback, useEffect, useState } from "react";
import { SubmitCastAddRequest } from "@nook/common/types";
import { useCast } from "../../../api/farcaster";
import { FarcasterCastResponsePreview } from "../../../components/farcaster/casts/cast-preview";
import { useTheme } from "../../../context/theme";

export const CreateCastDialog = ({
  children,
  initialState,
}: {
  children?: React.ReactNode;
  initialState: SubmitCastAddRequest;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <CreateCastProvider initialCast={initialState}>
      <Dialog modal disableRemoveScroll open={isOpen} onOpenChange={setIsOpen}>
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

  return <FarcasterCastResponsePreview cast={cast} isConnected />;
};
