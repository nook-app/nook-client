import { config } from "@nook/config";

export type Conf = typeof config;

declare module "@nook/ui" {
  interface TamaguiCustomConfig extends Conf {}
}
