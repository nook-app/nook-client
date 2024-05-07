import { ReactNode } from "react";
import { darkenColor, stringToColor } from "../utils";
import { LinearGradient } from "@tamagui/linear-gradient";
import { Image } from "@nook/app-ui";

export const GradientIcon = ({
  icon,
  label,
  size,
  iconSize,
  noBorderRadius,
}: {
  icon: string;
  label: string;
  size?: string;
  iconSize?: number;
  noBorderRadius?: boolean;
}) => {
  const color = stringToColor(label);
  const backgroundColor = darkenColor(color);

  return (
    <LinearGradient
      width={size || "$5"}
      height={size || "$5"}
      borderRadius={noBorderRadius ? "$0" : "$4"}
      colors={[backgroundColor, color]}
      start={[1, 1]}
      end={[0, 0]}
      justifyContent="center"
      alignItems="center"
      padding="$2.5"
    >
      <Image
        source={{
          uri: `https://raw.githubusercontent.com/primer/octicons/main/icons/${icon}-24.svg`,
        }}
        width="100%"
        height="100%"
        tintColor="white"
      />
    </LinearGradient>
  );
};
