import { darkenColor, stringToColor } from "../utils";
import { LinearGradient } from "@tamagui/linear-gradient";
import { Image, View } from "@nook/app-ui";
import { ReactNode } from "react";

export const GradientIcon = ({
  icon,
  label,
  size,
  iconSize,
  noBorderRadius,
  borderRadius,
  children,
}: {
  icon?: string;
  children?: ReactNode;
  label: string;
  size?: string;
  iconSize?: number;
  borderRadius?: string;
  noBorderRadius?: boolean;
}) => {
  const color = stringToColor(label);
  const backgroundColor = darkenColor(color);

  return (
    <LinearGradient
      width={size || "$5"}
      height={size || "$5"}
      // @ts-ignore
      borderRadius={borderRadius || (noBorderRadius ? "$0" : "$4")}
      colors={[backgroundColor, color]}
      start={[1, 1]}
      end={[0, 0]}
      justifyContent="center"
      alignItems="center"
      padding="$2.5"
    >
      {icon ? (
        <Image
          source={{
            uri: `https://raw.githubusercontent.com/primer/octicons/main/icons/${icon}-24.svg`,
          }}
          width="100%"
          height="100%"
          tintColor="white"
        />
      ) : (
        <View>{children}</View>
      )}
    </LinearGradient>
  );
};
