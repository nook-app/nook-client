import { NookText, XStack } from "@nook/app-ui";
import { useCreateCast } from "./context";
import { CreateCastButton } from "./form";
import { UploadImageButton } from "./action-buttons";
import { AddCastButton } from "./add-cast-button";

export const CreateCastActionBar = ({
  onSubmit,
}: { onSubmit?: () => void }) => {
  const { activeCastLength } = useCreateCast();
  return (
    <XStack
      justifyContent="space-between"
      padding="$2"
      borderTopColor="$borderColorBg"
      borderTopWidth="$0.5"
    >
      <XStack>
        <UploadImageButton />
      </XStack>
      <XStack alignItems="center" gap="$3">
        <NookText
          color={activeCastLength > 320 ? "$red11" : "$mauve11"}
          fontWeight="500"
          fontSize="$4"
        >{`${activeCastLength} / 320`}</NookText>
        <AddCastButton />
        <CreateCastButton onSubmit={onSubmit} />
      </XStack>
    </XStack>
  );
};
