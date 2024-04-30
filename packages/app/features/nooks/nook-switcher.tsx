import { NookText, Popover, View, XStack, YStack } from "@nook/ui";
import { ReactNode } from "react";
import { Link } from "solito/link";
import { Check } from "@tamagui/lucide-icons";

export const NookSwitcher = ({ children }: { children: ReactNode }) => {
  return (
    <Popover placement="bottom" size="$5" allowFlip>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Content
        borderWidth={1}
        borderColor="$borderColorBg"
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          "100ms",
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
        paddingHorizontal="$0"
        paddingVertical="$2"
      >
        <Popover.Arrow borderWidth={1} borderColor="$borderColorBg" />
        <NookSwitcherContent />
      </Popover.Content>
    </Popover>
  );
};

export const NookSwitcherContent = () => {
  const isFarcon = window.location.href.includes("farcon.");
  const baseNook = window.location.href.replace("farcon.", "");
  const baseNookParts = baseNook.split("://");
  const farconNookParts = [
    baseNookParts[0],
    "://",
    "farcon.",
    ...baseNookParts.slice(1),
  ];
  const farconNook = farconNookParts.join("");
  return (
    <YStack>
      <Link href={baseNook}>
        <XStack
          justifyContent="space-between"
          alignItems="center"
          flexGrow={1}
          paddingVertical="$2.5"
          paddingHorizontal="$3"
          hoverStyle={{
            // @ts-ignore
            transition: "all 0.2s ease-in-out",
            backgroundColor: "$color3",
          }}
        >
          <View maxWidth="$10" $lg={{ maxWidth: "$6" }}>
            <NookText fontSize="$8" fontWeight="700" $lg={{ fontSize: "$6" }}>
              nook
            </NookText>
          </View>
          <View width="$8" alignItems="flex-end" justifyContent="center">
            {!isFarcon && <Check />}
          </View>
        </XStack>
      </Link>
      <Link href={farconNook}>
        <XStack
          justifyContent="space-between"
          alignItems="center"
          flexGrow={1}
          paddingVertical="$3"
          paddingHorizontal="$3"
          hoverStyle={{
            // @ts-ignore
            transition: "all 0.2s ease-in-out",
            backgroundColor: "$color3",
          }}
        >
          <View maxWidth="$10" $lg={{ maxWidth: "$6" }}>
            <img
              src="https://i.imgur.com/yii9EpK.png"
              alt="farcon"
              style={{ objectFit: "contain" }}
            />
          </View>
          <View width="$8" alignItems="flex-end" justifyContent="center">
            {isFarcon && <Check />}
          </View>
        </XStack>
      </Link>
    </YStack>
  );
};
