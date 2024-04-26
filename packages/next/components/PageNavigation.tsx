"use client";

import { useTheme } from "@nook/app/context/theme";
import { View, XStack } from "@nook/ui";
import { ReactNode } from "react";

export const PageNavigation = ({
  children,
  sidebar,
}: {
  children: ReactNode;
  sidebar?: ReactNode;
}) => {
  return (
    <XStack>
      <View
        minHeight="100vh"
        flex={1}
        borderLeftColor="$borderColor"
        borderLeftWidth="$0.5"
        borderRightColor="$borderColor"
        borderRightWidth="$0.5"
        $lg={{
          width: 300,
        }}
      >
        {children}
      </View>
      <View width={400} $md={{ display: "none" }}>
        {sidebar}
      </View>
    </XStack>
  );
};
