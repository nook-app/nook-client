"use client";

import { YStack } from "@nook/ui";
import { ThemeSettings } from "./theme-settings";

export const SettingsScreen = () => {
  return (
    <YStack gap="$3">
      <ThemeSettings />
    </YStack>
  );
};
