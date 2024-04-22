import { config } from "@nook/ui";

export type Conf = typeof config;

declare module "@nook/ui" {
  interface TamaguiCustomConfig extends Conf {}
}
