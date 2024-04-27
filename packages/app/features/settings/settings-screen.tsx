"use client";

import { Separator, YStack } from "@nook/ui";
import { ThemeSettings } from "./theme-settings";
import { MutedSettings } from "./muted-settings";
import { User } from "../../types";
import { ActionSettings } from "./action-settings";

export const SettingsScreen = ({ settings }: { settings: User }) => {
  return (
    <YStack>
      <ActionSettings />
      <Separator borderColor="$borderColorBg" />
      <ThemeSettings />
      <Separator borderColor="$borderColorBg" />
      <MutedSettings settings={settings} />
    </YStack>
  );
};
