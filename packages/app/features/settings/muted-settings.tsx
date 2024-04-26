import { NookText, View, XStack, YStack } from "@nook/ui";
import { ChevronRight } from "@tamagui/lucide-icons";
import { User } from "../../types";
import { Link } from "solito/link";

export const MutedSettings = ({ settings }: { settings: User }) => {
  return (
    <YStack gap="$4" paddingVertical="$4">
      <YStack gap="$2" paddingHorizontal="$4">
        <NookText variant="label">Mute</NookText>
        <NookText muted>
          Manage the words, accounts, and channels that you’ve muted or blocked.
        </NookText>
      </YStack>
      <YStack>
        <Link href="/settings/muted/users">
          <XStack
            alignItems="center"
            paddingHorizontal="$4"
            paddingVertical="$3"
            hoverStyle={{
              backgroundColor: "$color2",
              // @ts-ignore
              transition: "all 0.2s ease-in-out",
            }}
          >
            <YStack flex={1} gap="$1">
              <NookText color="$mauve12" fontWeight="600" fontSize="$5">
                Muted Users
              </NookText>
            </YStack>
            {settings?.mutedUsers && settings.mutedUsers.length > 0 && (
              <View paddingHorizontal="$2">
                <NookText color="$mauve11" fontSize="$5">
                  {settings.mutedUsers.length}
                </NookText>
              </View>
            )}
            <ChevronRight size={24} color="$mauve12" />
          </XStack>
        </Link>
        <Link href="/settings/muted/channels">
          <XStack
            alignItems="center"
            paddingHorizontal="$4"
            paddingVertical="$3"
            hoverStyle={{
              backgroundColor: "$color2",
              // @ts-ignore
              transition: "all 0.2s ease-in-out",
            }}
          >
            <YStack flex={1} gap="$1">
              <NookText color="$mauve12" fontWeight="600" fontSize="$5">
                Muted Channels
              </NookText>
            </YStack>
            {settings?.mutedChannels && settings.mutedChannels.length > 0 && (
              <View paddingHorizontal="$2">
                <NookText color="$mauve11" fontSize="$5">
                  {settings.mutedChannels.length}
                </NookText>
              </View>
            )}
            <ChevronRight size={24} color="$mauve12" />
          </XStack>
        </Link>
        <Link href="/settings/muted/words">
          <XStack
            alignItems="center"
            paddingHorizontal="$4"
            paddingVertical="$3"
            hoverStyle={{
              backgroundColor: "$color2",
              // @ts-ignore
              transition: "all 0.2s ease-in-out",
            }}
          >
            <YStack flex={1} gap="$1">
              <NookText color="$mauve12" fontWeight="600" fontSize="$5">
                Muted Words
              </NookText>
            </YStack>
            {settings?.mutedWords && settings.mutedWords.length > 0 && (
              <View paddingHorizontal="$2">
                <NookText color="$mauve11" fontSize="$5">
                  {settings.mutedWords.length}
                </NookText>
              </View>
            )}
            <ChevronRight size={24} color="$mauve12" />
          </XStack>
        </Link>
      </YStack>
    </YStack>
  );
};
