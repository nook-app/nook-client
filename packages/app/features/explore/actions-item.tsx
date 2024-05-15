import {
  AnimatePresence,
  Button,
  NookButton,
  NookText,
  View,
  XStack,
  YStack,
} from "@nook/app-ui";
import { memo } from "react";
import { CastAction } from "@nook/common/types";
import { GradientIcon } from "../../components/gradient-icon";
import { InstallActionDialog } from "../actions/install-dialog";

export const FarcasterActionItem = memo(
  ({ action }: { action: CastAction }) => {
    let host: string | undefined;
    try {
      host = new URL(action.postUrl).host;
    } catch (e) {}
    return (
      <AnimatePresence>
        <View
          enterStyle={{
            opacity: 0,
          }}
          exitStyle={{
            opacity: 0,
          }}
          animation="quick"
          opacity={1}
          scale={1}
          y={0}
        >
          <XStack
            gap="$2.5"
            padding="$2.5"
            hoverStyle={{
              transform: "all 0.2s ease-in-out",
              backgroundColor: "$color2",
            }}
          >
            <GradientIcon label={action.name} size="$5" icon={action.icon} />
            <YStack flexShrink={1} flexGrow={1} gap="$1">
              <XStack justifyContent="space-between" gap="$2">
                <YStack flexShrink={1}>
                  <NookText variant="label" fontSize="$6">
                    {action.name}
                  </NookText>
                  <NookText muted>{host}</NookText>
                </YStack>
                <InstallActionDialog action={action}>
                  <Button
                    height="$3"
                    borderRadius="$10"
                    fontWeight="600"
                    backgroundColor="$mauve12"
                    borderWidth="$0"
                    color="$mauve1"
                    pressStyle={{
                      backgroundColor: "$mauve11",
                    }}
                    disabledStyle={{
                      backgroundColor: "$mauve10",
                    }}
                  >
                    Install
                  </Button>
                </InstallActionDialog>
              </XStack>
              <NookText>{action.description}</NookText>
            </YStack>
          </XStack>
        </View>
      </AnimatePresence>
    );
  },
);
