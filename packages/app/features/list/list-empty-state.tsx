import { NookText, YStack } from "@nook/app-ui";
import { ListType } from "@nook/common/types";
import { CreateListTrigger } from "./create-list-trigger";

export const ListEmptyState = ({ type }: { type?: ListType }) => {
  return (
    <YStack gap="$4" padding="$4" justifyContent="center" alignItems="center">
      <NookText muted textAlign="center">
        No lists found. Create a list to group together users or channels.
      </NookText>
      <CreateListTrigger type={type} />
    </YStack>
  );
};
