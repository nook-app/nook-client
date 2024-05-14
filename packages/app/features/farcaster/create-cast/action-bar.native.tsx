import { NookText, XStack } from "@nook/app-ui";
import { useCreateCast } from "./context";
import { UploadImageButton } from "./action-buttons";

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
      </XStack>
    </XStack>
  );
};
