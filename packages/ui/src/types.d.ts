import { config } from "@nook/config";

export type Conf = typeof config;

declare module "tamagui" {
  type TamaguiCustomConfig = Conf;
}
