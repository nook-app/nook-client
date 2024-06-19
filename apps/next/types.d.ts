import { config } from "@nook/app-ui";

export type Conf = typeof config;

declare module "@nook/app-ui" {
  interface TamaguiCustomConfig extends Conf {}
}
