"use client";

import { NookButton, NookText } from "@nook/app-ui";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { useRouter } from "next/navigation";
import { XStack } from "tamagui";

export const NavigationHeader = ({
  backHref,
  title,
  right,
}: {
  backHref?: string;
  title: string;
  right?: React.ReactNode;
}) => {
  const router = useRouter();
  return (
    <XStack
      height="$5"
      paddingHorizontal="$3"
      justifyContent="space-between"
      alignItems="center"
    >
      <XStack gap="$5" alignItems="center">
        <NookButton
          icon={<ArrowLeft />}
          circular
          size="$3"
          scaleIcon={1.5}
          backgroundColor="transparent"
          borderWidth="$0"
          hoverStyle={{
            // @ts-ignore
            transition: "all 0.2s ease-in-out",
            backgroundColor: "$color3",
          }}
          onPress={backHref ? () => router.replace(backHref) : router.back}
        />
        <NookText variant="label">{title}</NookText>
      </XStack>
      {right}
    </XStack>
  );
};
