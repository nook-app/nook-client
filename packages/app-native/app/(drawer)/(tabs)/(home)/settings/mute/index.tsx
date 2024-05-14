import { NookText, Text, View, XStack, YStack } from "@nook/app-ui";
import { Href } from "expo-router/build/link/href";
import { ChevronRight } from "@tamagui/lucide-icons";
import { useAuth } from "@nook/app/context/auth";
import { Link } from "@nook/app/components/link";
import { useMuteStore } from "@nook/app/store/useMuteStore";

export default function MuteSettings() {
  const users = useMuteStore(
    (state) => Object.values(state.users).filter(Boolean).length,
  );
  const channels = useMuteStore(
    (state) => Object.values(state.channels).filter(Boolean).length,
  );
  const words = useMuteStore(
    (state) => Object.values(state.words).filter(Boolean).length,
  );
  return (
    <YStack flexGrow={1} backgroundColor="$color1" gap="$4" paddingTop="$2.5">
      <NookText muted paddingHorizontal="$2.5">
        Manage the words, accounts, and channels that you’ve muted or blocked.
      </NookText>
      <MuteSettingsItem
        title="Muted Users"
        amount={users}
        href="/settings/mute/users"
      />
      <MuteSettingsItem
        title="Muted Channels"
        amount={channels}
        href="/settings/mute/channels"
      />
      <MuteSettingsItem
        title="Muted Words"
        amount={words}
        href="/settings/mute/words"
      />
    </YStack>
  );
}

const MuteSettingsItem = ({
  title,
  amount,
  href,
}: {
  title: string;
  amount: number;
  href: Href;
}) => {
  return (
    <Link href={href}>
      <XStack alignItems="center" paddingHorizontal="$3" paddingVertical="$2">
        <YStack flex={1} gap="$1">
          <Text color="$mauve12" fontWeight="600" fontSize="$5">
            {title}
          </Text>
        </YStack>
        {amount > 0 && (
          <View paddingHorizontal="$2">
            <Text color="$mauve11" fontSize="$5">
              {amount}
            </Text>
          </View>
        )}
        <ChevronRight size={24} color="$mauve12" />
      </XStack>
    </Link>
  );
};
