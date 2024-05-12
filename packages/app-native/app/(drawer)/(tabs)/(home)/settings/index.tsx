import { Text, View, XStack, YStack } from "@nook/app-ui";
import { Href } from "expo-router/build/link/href";
import { ComponentType } from "react";
import {
  Bell,
  ChevronRight,
  Palette,
  VolumeX,
  LayoutGrid,
  User,
} from "@tamagui/lucide-icons";
import { Link } from "@nook/app/components/link";

export default function Settings() {
  return (
    <YStack flexGrow={1} backgroundColor="$color1" gap="$6" paddingTop="$6">
      <SettingsItem
        title="Profile"
        description="Set your profile picture, display name, and bio."
        Icon={User}
        href="/settings/profile"
      />
      <SettingsItem
        title="Theme"
        description="Change the theme for your account."
        Icon={Palette}
        href="/settings/theme"
      />
      <SettingsItem
        title="Cast Actions"
        description="Add custom actions to use on casts."
        Icon={LayoutGrid}
        href="/settings/actions"
      />
      <SettingsItem
        title="Mute"
        description="Manage the accounts, channels, and words that you've muted."
        Icon={VolumeX}
        href="/settings/mute"
      />
      <SettingsItem
        title="Notifications"
        description="Manage the kinds of notifications you receive from Nook."
        Icon={Bell}
        href="/settings/notifications"
      />
    </YStack>
  );
}

const SettingsItem = ({
  title,
  description,
  Icon,
  href,
}: {
  title: string;
  description: string;
  Icon: ComponentType<{ size: number; color: string }>;
  href: Href;
}) => {
  return (
    <Link href={href}>
      <XStack alignItems="center">
        <View padding="$3">
          <Icon size={20} color="$mauve11" />
        </View>
        <YStack flex={1} gap="$1">
          <Text color="$mauve12" fontWeight="600">
            {title}
          </Text>
          <Text color="$mauve11">{description}</Text>
        </YStack>
        <View padding="$2">
          <ChevronRight size={24} color="$mauve12" />
        </View>
      </XStack>
    </Link>
  );
};
