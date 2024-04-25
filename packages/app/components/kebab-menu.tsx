import { ListItem, NookText, Popover, View, YGroup } from "@nook/ui";
import { MoreHorizontal } from "@tamagui/lucide-icons";
import { NamedExoticComponent } from "react";

export const KebabMenu = ({
  trigger,
  children,
}: { trigger?: React.ReactNode; children: React.ReactNode }) => {
  return (
    <View
      onPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Popover placement="bottom">
        <Popover.Trigger>{trigger ? trigger : <KebabButton />}</Popover.Trigger>
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
          <Popover.Arrow borderWidth={1} borderColor="$borderColor" />
          <YGroup alignSelf="center" bordered size="$4" overflow="hidden">
            {children}
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
}: {
  Icon: NamedExoticComponent | JSX.Element;
  title: string;
  color?: string;
  onPress?: () => void;
}) => (
  <YGroup.Item key={title}>
    <ListItem
      hoverTheme
      icon={Icon}
      color={color}
      onPress={onPress}
      style={{ cursor: "pointer" }}
      justifyContent="flex-start"
    >
      <NookText cursor="pointer" color={color}>
        {title}
      </NookText>
    </ListItem>
  </YGroup.Item>
);

const KebabButton = () => (
  <View
    cursor="pointer"
    width="$2.5"
    height="$2.5"
    justifyContent="center"
    alignItems="center"
    borderRadius="$10"
    group
    hoverStyle={{
      // @ts-ignore
      transition: "all 0.2s ease-in-out",
      backgroundColor: "$color3",
    }}
    marginHorizontal="$-2"
  >
    {/* @ts-ignore */}
    <MoreHorizontal
      size={20}
      opacity={0.4}
      color="$mauve12"
      $group-hover={{
        transition: "all 0.2s ease-in-out",
        color: "$mauve12",
        opacity: 1,
      }}
    />
  </View>
);
