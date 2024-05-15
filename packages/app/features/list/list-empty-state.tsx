import { Button, NookText, YStack } from "@nook/app-ui";
import { ListType } from "@nook/common/types";
import { Link } from "../../components/link";

export const ListEmptyState = ({ type }: { type?: ListType }) => {
  return (
    <YStack gap="$4" padding="$4" justifyContent="center" alignItems="center">
      <NookText muted textAlign="center">
        No lists found. Create a list to group together users or channels.
      </NookText>
      <Link
        href={{
          pathname: "/create/list",
          params: { type },
        }}
        unpressable
        absolute
      >
        <Button
          height="$4"
          width="100%"
          borderRadius="$10"
          fontWeight="600"
          fontSize="$5"
          backgroundColor="$mauve12"
          borderWidth="$0"
          color="$mauve1"
          pressStyle={{
            backgroundColor: "$mauve11",
          }}
          disabledStyle={{
            backgroundColor: "$mauve10",
          }}
        >
          Create List
        </Button>
      </Link>
    </YStack>
  );
};
