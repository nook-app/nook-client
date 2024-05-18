import { useEffect, useState } from "react";
import { getColors } from "react-native-image-colors";
import { useTheme } from "@nook/app-ui";
import { darkenColor, stringToColor } from "@nook/app/utils";

export type Colors = {
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  detailColor: string;
};

export const useImageColors = (uri?: string) => {
  const theme = useTheme();
  const [colors, setColors] = useState<Colors>({
    backgroundColor: theme.color1.val,
    primaryColor: theme.color1.val,
    secondaryColor: theme.color1.val,
    detailColor: theme.color1.val,
  });

  useEffect(() => {
    const getAndSet = async () => {
      if (!uri) return;
      const got = await getColors(uri, {
        fallback: "#228B22",
        cache: true,
        key: uri,
      });
      if (got.platform === "android") {
        setColors({
          backgroundColor: got.dominant,
          primaryColor: got.average,
          secondaryColor: got.average,
          detailColor: got.average,
        });
      } else if (got.platform === "ios") {
        setColors({
          backgroundColor: got.background,
          primaryColor: got.primary,
          secondaryColor: got.secondary,
          detailColor: got.secondary,
        });
      }
    };
    if (uri?.startsWith("http")) {
      getAndSet();
    } else if (uri) {
      const color = stringToColor(uri);
      const backgroundColor = darkenColor(color);
      setColors({
        backgroundColor,
        primaryColor: color,
        secondaryColor: color,
        detailColor: backgroundColor,
      });
    }
  }, [uri]);

  return colors;
};
