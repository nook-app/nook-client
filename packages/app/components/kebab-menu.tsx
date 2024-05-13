import { Adapt, ListItem, NookText, Popover, View, YGroup } from "@nook/app-ui";
import { MoreHorizontal } from "@tamagui/lucide-icons";
import {
  Children,
  NamedExoticComponent,
  ReactNode,
  cloneElement,
  isValidElement,
  useState,
} from "react";

export const KebabMenu = ({
  trigger,
  children,
}: { trigger?: React.ReactNode; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);

  const childrenWithProps = Children.map(children, (child) => {
    if (isValidElement<{ closeMenu: () => void }>(child)) {
      return cloneElement(child, { closeMenu: () => setOpen(false) });
    }
    return child;
  });

  return (
    <View
      onPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Popover placement="bottom" open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          {trigger ? trigger : <KebabButton />}
        </Popover.Trigger>

        <Adapt when="sm" platform="touch">
          <Popover.Sheet modal dismissOnSnapToBottom>
            <Popover.Sheet.Frame padding="$4">
              <Adapt.Contents />
            </Popover.Sheet.Frame>
            <Popover.Sheet.Overlay
              animation="lazy"
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />
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
        >
          <Popover.Arrow borderWidth={1} borderColor="$borderColorBg" />
          <YGroup alignSelf="center" bordered size="$4" overflow="hidden">
            {childrenWithProps}
          </YGroup>
        </Popover.Content>
      </Popover>
    </View>
  );
};

export const KebabMenuItem = ({
  Icon,
  title,
  color,
  onPress,
  closeMenu,
}: {
  Icon: NamedExoticComponent | JSX.Element;
  title: string;
  color?: string;
  onPress?: () => void;
  closeMenu?: () => void;
}) => (
  <YGroup.Item key={title}>
    <ListItem
      hoverTheme
      icon={Icon}
      color={color}
      onPress={() => {
        onPress?.();
        closeMenu?.();
      }}
      style={{ cursor: "pointer" }}
      justifyContent="flex-start"
      scaleIcon={1.2}
    >
      <NookText cursor="pointer" color={color} fontWeight="500">
        {title}
      </NookText>
    </ListItem>
  </YGroup.Item>
);

const KebabButton = () => (
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
      backgroundColor: "$color3",
    }}
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
);
