"use client";

import { NookButton, NookText, View, XStack } from "@nook/ui";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export const PageNavigation = ({
  children,
  sidebar,
  headerTitle,
}: {
  children: ReactNode;
  sidebar?: ReactNode;
  headerTitle?: ReactNode;
}) => {
  const router = useRouter();
  return (
    <XStack>
      <View
        minHeight="100vh"
        flex={1}
        borderLeftColor="rgba(256, 256, 256, 0.1)"
        borderLeftWidth="$0.5"
        borderRightColor="rgba(256, 256, 256, 0.1)"
        borderRightWidth="$0.5"
      >
        {headerTitle && (
          <XStack
            gap="$5"
            height="$5"
            alignItems="center"
            paddingHorizontal="$3"
          >
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
              onPress={router.back}
            />
            <NookText variant="label">{headerTitle}</NookText>
          </XStack>
        )}
        {children}
      </View>
      <View width={400}>{sidebar}</View>
    </XStack>
  );
};
