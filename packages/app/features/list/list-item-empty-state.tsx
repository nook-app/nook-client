"use client";

import { Button, NookText, YStack } from "@nook/app-ui";
import { List, ListType } from "@nook/common/types";
import { Link } from "../../components/link";

export const ListItemEmptyState = ({ list }: { list: List }) => {
  return (
    <YStack gap="$4" padding="$4" justifyContent="center" alignItems="center">
      <NookText muted>
        {`Add ${
          list.type === ListType.USERS ? "users" : "channels"
        } to this list to see casts here.`}
      </NookText>
      <Link href={`/lists/${list.id}/settings/items`} unpressable>
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
          {`Add ${list.type === ListType.USERS ? "Users" : "Channels"}`}
        </Button>
      </Link>
    </YStack>
  );
};
