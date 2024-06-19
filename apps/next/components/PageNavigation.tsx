"use client";

import { View, XStack } from "@nook/app-ui";
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
        borderLeftColor="$borderColorBg"
        borderLeftWidth="$0.5"
        borderRightColor="$borderColorBg"
        borderRightWidth="$0.5"
      >
        {children}
      </View>
      <View width={380} $md={{ display: "none" }}>
        {sidebar}
      </View>
    </XStack>
  );
};
