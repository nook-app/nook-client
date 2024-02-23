import { XStack, YStack } from "tamagui";
import { ReactNode } from "react";
import { EntityAvatar } from "@/components/entity/EntityAvatar";
import { EntityDisplay } from "../entity/EntityDisplay";

export const EmbedQuote = ({
  entityId,
  children,
}: {
  entityId: string;
  children: ReactNode;
}) => {
  return (
    <YStack
      borderWidth="$0.5"
      borderColor="$borderColor"
      borderRadius="$2"
      padding="$2.5"
      marginVertical="$2"
      gap="$2"
    >
      <XStack gap="$1" alignItems="center">
        <EntityAvatar entityId={entityId} size="$1" />
        <EntityDisplay entityId={entityId} orientation="horizontal" />
      </XStack>
      {children}
    </YStack>
  );
};
