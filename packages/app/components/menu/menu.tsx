import { ReactNode } from "react";
import { Menu as NativeMenu } from "./menu.native";

export const Menu = ({
  trigger,
  children,
}: { trigger?: ReactNode; children: ReactNode }) => {
  return <NativeMenu trigger={trigger}>{children}</NativeMenu>;
};
