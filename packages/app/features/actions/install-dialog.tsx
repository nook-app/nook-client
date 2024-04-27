import { Dot, X } from "@tamagui/lucide-icons";
import { NookButton, Dialog, XStack, View, YStack, NookText } from "@nook/ui";
import { useCallback, useState } from "react";
import { CastAction } from "../../types";
import { GradientIcon } from "../../components/gradient-icon";
import { useAuth } from "../../context/auth";
import { installAction } from "../../server/settings";
import { useQueryClient } from "@tanstack/react-query";

export const InstallActionDialog = ({
  children,
  action,
}: {
  children?: React.ReactNode;
  action: CastAction;
}) => {
  const queryClient = useQueryClient();
  const { settings } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);

  const handlePress = useCallback(
    async (index: number) => {
      await installAction(index, action);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      close();
    },
    [action, close, queryClient],
  );

  const actions: (CastAction | null)[] = [];
  for (let i = 0; i < 8; i++) {
    const existingAction = settings?.actions.find((a) => a.index === i);
    actions.push(existingAction ? existingAction.action : null);
  }

  const topBar = actions?.slice(0, 4);
  const bottomBar = actions?.slice(4);

  return (
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
          <XStack gap="$4" padding="$4">
            <GradientIcon label={action.name} size="$6" icon={action.icon} />
            <View>
              <Dialog.Title>{action.name}</Dialog.Title>
              <Dialog.Description>{action.description}</Dialog.Description>
            </View>
          </XStack>
          <YStack gap="$5" padding="$4">
            <NookText fontWeight="500">Select an action to replace</NookText>
            <XStack gap="$5">
              {topBar.map((a, i) => (
                <NookButton
                  key={`top-${i}`}
                  backgroundColor="$color3"
                  padding="$0"
                  height="auto"
                  hoverStyle={{
                    opacity: 0.5,
                    // @ts-ignore
                    transition: "all 0.2s ease-in-out",
                  }}
                  borderWidth="$0"
                  overflow="hidden"
                  onClick={() => handlePress(i)}
                >
                  {a && (
                    <GradientIcon label={a?.name} size="$6" icon={a?.icon} />
                  )}
                  {!a && (
                    <View
                      width="$6"
                      height="$6"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Dot size={32} />
                    </View>
                  )}
                </NookButton>
              ))}
            </XStack>
            <XStack gap="$5">
              {bottomBar.map((a, i) => (
                <NookButton
                  key={`bottom-${i}`}
                  backgroundColor="$color3"
                  padding="$0"
                  height="auto"
                  hoverStyle={{
                    opacity: 0.5,
                    // @ts-ignore
                    transition: "all 0.2s ease-in-out",
                  }}
                  borderWidth="$0"
                  overflow="hidden"
                  onPress={() => handlePress(i + 4)}
                >
                  {a && (
                    <GradientIcon label={a?.name} size="$6" icon={a?.icon} />
                  )}
                  {!a && (
                    <View
                      width="$6"
                      height="$6"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Dot size={32} />
                    </View>
                  )}
                </NookButton>
              ))}
            </XStack>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
