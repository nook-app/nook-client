"use client";

import { View, XStack } from "@nook/ui";
import { ReactNode } from "react";

export const PageNavigation = ({
  children,
  sidebar,
}: { children: ReactNode; sidebar?: ReactNode }) => {
  return (
    <XStack>
      <View
        minHeight="100vh"
        flex={1}
        borderLeftColor="$color4"
        borderLeftWidth="$0.5"
        borderRightColor="$color4"
        borderRightWidth="$0.5"
      >
        {children}
      </View>
      <View width={400}>{sidebar}</View>
    </XStack>
  );
};
