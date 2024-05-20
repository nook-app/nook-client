import {
  ListItem,
  NookText,
  Separator,
  TamaguiElement,
  View,
  YGroup,
} from "@nook/app-ui";
import { NamedExoticComponent, forwardRef } from "react";

interface MenuItemProps {
  Icon?: NamedExoticComponent | JSX.Element;
  image?: JSX.Element;
  title: string;
  color?: string;
  onPress?: () => void;
  hideSeparator?: boolean;
}

export const MenuItem = forwardRef<TamaguiElement, MenuItemProps>(
  ({ Icon, image, title, color, onPress, hideSeparator }, ref) => (
    <YGroup.Item key={title}>
      <ListItem
        hoverTheme
        ref={ref}
        icon={Icon}
        color={color}
        onPress={onPress}
        style={{ cursor: "pointer" }}
        justifyContent="flex-start"
        scaleIcon={1.2}
      >
        {image && <View width="$2.5">{image}</View>}
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
  ),
);

MenuItem.displayName = "MenuItem";
