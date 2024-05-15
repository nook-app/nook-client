import { View } from "@nook/app-ui";
import { formatToCDN } from "../utils";
import { ReactNode } from "react";
import { SvgUri } from "react-native-svg";
import { Image } from "expo-image";

export const CdnAvatar = ({
  src,
  size,
  absolute,
  children,
}: {
  src?: string;
  size: string;
  absolute?: boolean;
  children?: ReactNode;
}) => {
  const formattedSrc =
    src && !src?.endsWith(".svg") && !absolute
      ? formatToCDN(src, { width: 168 })
      : src;

  return (
    <View
      borderRadius="$10"
      width={size}
      height={size}
      backgroundColor="$color3"
      overflow="hidden"
      alignItems="center"
      justifyContent="center"
    >
      {children}
      {formattedSrc && !formattedSrc?.endsWith(".svg") && (
        <Image
          recyclingKey={formattedSrc}
          source={{ uri: formattedSrc }}
          style={{ width: "100%", height: "100%" }}
          allowDownscaling={false}
        />
      )}
      {formattedSrc?.endsWith(".svg") && (
        <SvgUri uri={formattedSrc} width="100%" height="100%" />
      )}
    </View>
  );
};
