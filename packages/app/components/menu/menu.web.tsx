import { View } from "@nook/app-ui";
import { ReactNode } from "react";
import { Menu as NativeMenu } from "./menu.native";

export const Menu = ({
  trigger,
  children,
}: { trigger?: ReactNode; children: ReactNode }) => {
  return (
    <View
      onPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <NativeMenu trigger={trigger}>{children}</NativeMenu>
    </View>
  );
};
