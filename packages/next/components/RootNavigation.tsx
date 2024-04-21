"use client";

import { Text, View, XStack, YStack } from "@nook/ui";

export const RootNavigation = ({ children }: { children: React.ReactNode }) => {
  return (
    <XStack justifyContent="center" flex={1} backgroundColor="$color1">
      <View width={300} maxWidth={300} alignItems="flex-end">
        <YStack
          width="60%"
          gap="$3"
          top={0}
          $platform-web={{
            position: "sticky",
          }}
        >
          <Text fontSize="$8" fontWeight="600" color="$mauve12">
            nook
          </Text>
          <Text color="$mauve12">home</Text>
        </YStack>
      </View>
      <View width={1000} maxWidth={1000}>
        {children}
      </View>
    </XStack>
  );
};
