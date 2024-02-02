import { ReactNode } from "react";
import { Text as TamaguiText } from "tamagui";

export const Text = ({
  children,
  bold,
  muted,
  highlight,
}: {
  children: ReactNode;
  bold?: boolean;
  muted?: boolean;
  highlight?: boolean;
}) => {
  const color = muted ? "$gray11" : highlight ? "$color10" : "$gray12";
  const fontWeight = bold ? "700" : "400";
  return (
    <TamaguiText color={color} fontWeight={fontWeight}>
      {children}
    </TamaguiText>
  );
};
