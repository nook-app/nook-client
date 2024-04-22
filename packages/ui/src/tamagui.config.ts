import { config as configBase } from "@tamagui/config";
import { createTamagui } from "tamagui";
import { themes } from "./themes";

export const config = createTamagui({
  ...configBase,
  tokens: {
    ...configBase.tokens,
    size: {
      ...configBase.tokens.size,
      0.8: 12,
      0.85: 14,
      0.9: 16,
      0.95: 18,
    },
  },
  fonts: {
    ...configBase.fonts,
    heading: {
      ...configBase.fonts.body,
      face: {
        100: { normal: "Inter" },
        200: { normal: "Inter" },
        300: { normal: "Inter" },
        400: { normal: "Inter" },
        500: { normal: "InterMedium" },
        600: { normal: "InterSemiBold" },
        700: { normal: "InterBold" },
        800: { normal: "InterBold" },
        900: { normal: "InterBold" },
      },
    },
    body: {
      ...configBase.fonts.body,
      face: {
        100: { normal: "Inter" },
        200: { normal: "Inter" },
        300: { normal: "Inter" },
        400: { normal: "Inter" },
        500: { normal: "InterMedium" },
        600: { normal: "InterSemiBold" },
        700: { normal: "InterBold" },
        800: { normal: "InterBold" },
        900: { normal: "InterBold" },
      },
    },
  },
  themes: themes,
});

export default config;

export type Conf = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}
