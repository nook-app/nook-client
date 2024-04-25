"use client";

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
        borderLeftColor="rgba(256, 256, 256, 0.1)"
        borderLeftWidth="$0.5"
        borderRightColor="rgba(256, 256, 256, 0.1)"
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
