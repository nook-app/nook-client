import { Dimensions } from "react-native";

type DeviceDimensions = { fullHeight: number; fullWidth: number };

export const useDeviceDimensions = (): DeviceDimensions => {
  const fullHeight = Dimensions.get("screen").height;
  const fullWidth = Dimensions.get("window").width;
  return { fullHeight, fullWidth };
};
