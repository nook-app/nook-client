"use client";

import { NookText, Separator, View, YStack } from "@nook/app-ui";
import { ThemeSettings } from "./theme-settings";
import { MutedSettings } from "./muted-settings";
import { User } from "@nook/common/types";
import { ActionSettings } from "./action-settings";
import { ProfileSettings } from "./profile-settings";
import { UsernameSettings } from "./username-settings";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "../../utils/wagmi";

export const SettingsScreen = ({ settings }: { settings: User }) => {
  return (
    <YStack>
      <View paddingHorizontal="$2.5">
        <NookText variant="label">Profile Settings</NookText>
      </View>
      <ProfileSettings />
      <Separator borderColor="$borderColorBg" />
      <WagmiProvider config={wagmiConfig}>
        <UsernameSettings />
      </WagmiProvider>
      <Separator borderColor="$borderColorBg" />
      <View paddingHorizontal="$2.5" paddingTop="$2.5">
        <NookText variant="label">Theme</NookText>
      </View>
      <ThemeSettings />
      <Separator borderColor="$borderColorBg" />
      <View paddingHorizontal="$2.5" paddingTop="$2.5">
        <NookText variant="label">Actions</NookText>
      </View>
      <ActionSettings />
      <Separator borderColor="$borderColorBg" />
      <View paddingHorizontal="$2.5" paddingTop="$2.5">
        <NookText variant="label">Mute</NookText>
      </View>
      <MutedSettings settings={settings} />
    </YStack>
  );
};
