"use client";

import { Separator, YStack } from "@nook/ui";
import { ThemeSettings } from "./theme-settings";
import { MutedSettings } from "./muted-settings";
import { User } from "../../types";

export const SettingsScreen = ({ settings }: { settings: User }) => {
  return (
    <YStack>
      <ThemeSettings />
      <Separator borderColor="$borderColor" />
      <MutedSettings settings={settings} />
    </YStack>
  );
};
