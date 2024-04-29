"use client";

import { Separator, YStack } from "@nook/ui";
import { ThemeSettings } from "./theme-settings";
import { MutedSettings } from "./muted-settings";
import { User } from "../../types";
import { ActionSettings } from "./action-settings";
import { ProfileSettings } from "./profile-settings";
import { UsernameSettings } from "./username-settings";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "../../utils/wagmi";

export const SettingsScreen = ({ settings }: { settings: User }) => {
  return (
    <YStack>
      <ProfileSettings />
      <Separator borderColor="$borderColorBg" />
      <WagmiProvider config={wagmiConfig}>
        <UsernameSettings />
      </WagmiProvider>
      <Separator borderColor="$borderColorBg" />
      <ThemeSettings />
      <Separator borderColor="$borderColorBg" />
      <ActionSettings />
      <Separator borderColor="$borderColorBg" />
      <MutedSettings settings={settings} />
    </YStack>
  );
};
