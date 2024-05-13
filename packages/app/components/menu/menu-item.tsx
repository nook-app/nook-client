import { ListItem, NookText, Separator, YGroup } from "@nook/app-ui";
import { NamedExoticComponent } from "react";

export const MenuItem = ({
  Icon,
  title,
  color,
  onPress,
  hideSeparator,
}: {
  Icon: NamedExoticComponent | JSX.Element;
  title: string;
  color?: string;
  onPress?: () => void;
  hideSeparator?: boolean;
}) => (
  <YGroup.Item key={title}>
    <ListItem
      hoverTheme
      icon={Icon}
      color={color}
      onPress={onPress}
      style={{ cursor: "pointer" }}
      justifyContent="flex-start"
      scaleIcon={1.2}
    >
      <NookText cursor="pointer" color={color} fontWeight="500">
        {title}
      </NookText>
    </ListItem>
    {!hideSeparator && (
      <Separator
        width="100%"
        borderBottomColor="$borderColorBg"
        opacity={0.5}
        borderBottomWidth="$0.25"
      />
    )}
  </YGroup.Item>
);
