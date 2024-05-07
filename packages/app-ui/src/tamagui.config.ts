import { config as configBase } from "@tamagui/config";
import { createTamagui } from "tamagui";
import { themes } from "./themes";

export const config = createTamagui({
  ...configBase,
  media: {
    ...configBase.media,
    xl: { maxWidth: 1650 - 15 },
    lg: { maxWidth: 1280 - 15 },
    md: { maxWidth: 1020 - 15 },
    sm: { maxWidth: 800 - 15 },
    xs: { maxWidth: 660 - 15 },
    xxs: { maxWidth: 390 - 15 },
    gtXs: { minWidth: 660 - 14 },
    gtSm: { minWidth: 800 - 14 },
    gtMd: { minWidth: 1020 - 14 },
    gtLg: { minWidth: 1280 - 14 },
    gtXl: { minWidth: 1650 - 14 },
  },
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
