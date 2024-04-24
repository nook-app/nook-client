"use client";

import { NookButton, NookText, View, XStack } from "@nook/ui";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export const PageNavigation = ({
  children,
  sidebar,
}: {
  children: ReactNode;
  sidebar?: ReactNode;
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
        {children}
      </View>
      <View width={400}>{sidebar}</View>
    </XStack>
  );
};
