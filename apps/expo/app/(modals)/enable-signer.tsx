import { NookButton, View, XStack } from "@nook/app-ui";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "@tamagui/lucide-icons";
import { EnableSignerContent } from "@nook/app/features/farcaster/enable-signer/content";

export default function EnableSignerModal() {
  const insets = useSafeAreaInsets();

  return (
    <View
      flex={1}
      backgroundColor="$color1"
      paddingTop={insets.top}
      paddingBottom={insets.bottom}
    >
      <XStack alignItems="center" justifyContent="space-between" padding="$2">
        <NookButton
          size="$3"
          scaleIcon={1.5}
          circular
          icon={X}
          backgroundColor="transparent"
          borderWidth="$0"
          hoverStyle={{
            backgroundColor: "$color4",
            // @ts-ignore
            transition: "all 0.2s ease-in-out",
          }}
          onPress={router.back}
        />
      </XStack>
      <EnableSignerContent />
    </View>
  );
}
