import { Adapt, Popover, Separator, View, YGroup } from "@nook/app-ui";
import { MoreHorizontal } from "@tamagui/lucide-icons";
import { ReactNode, useEffect } from "react";
import { MenuProvider, useMenu } from "./context";
import { haptics } from "../../utils/haptics";

export const Menu = ({
  trigger,
  children,
}: { trigger?: ReactNode; children: ReactNode }) => {
  return (
    <MenuProvider>
      <MenuInner trigger={trigger}>{children}</MenuInner>
    </MenuProvider>
  );
};

const MenuInner = ({
  trigger,
  children,
}: { trigger?: ReactNode; children: ReactNode }) => {
  const { isOpen, setIsOpen } = useMenu();

  useEffect(() => {
    if (isOpen) {
      haptics.selection();
    }
  }, [isOpen]);

  return (
    <Popover placement="bottom" open={isOpen} onOpenChange={setIsOpen}>
      {trigger || (
        <Popover.Trigger asChild>
          <View
            cursor="pointer"
            width="$1"
            height="$1"
            justifyContent="center"
            alignItems="center"
            borderRadius="$10"
            group
            hoverStyle={{
              // @ts-ignore
              transition: "all 0.2s ease-in-out",
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {/* @ts-ignore */}
            <MoreHorizontal
              size={20}
              opacity={0.75}
              color="$mauve11"
              $group-hover={{
                transition: "all 0.2s ease-in-out",
                color: "$mauve12",
                opacity: 1,
              }}
            />
          </View>
        </Popover.Trigger>
      )}
      <Adapt when="sm" platform="touch">
        <Popover.Sheet modal dismissOnSnapToBottom snapPointsMode="fit">
          <Popover.Sheet.Overlay
            animation="quick"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <Popover.Sheet.Frame
            paddingBottom="$8"
            paddingTop="$2"
            backgroundColor="$color2"
          >
            <Adapt.Contents />
          </Popover.Sheet.Frame>
        </Popover.Sheet>
      </Adapt>
      <Popover.Content
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          "100ms",
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
        padding="$0"
        cursor="pointer"
        bordered
      >
        <Popover.Arrow borderWidth={1} borderColor="$borderColorBg" />
        <YGroup alignSelf="center" size="$4" overflow="hidden" width="100%">
          {children}
        </YGroup>
      </Popover.Content>
    </Popover>
  );
};
