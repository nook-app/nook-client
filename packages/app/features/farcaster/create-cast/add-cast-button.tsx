import { Plus } from "@tamagui/lucide-icons";
import { useCreateCast } from "./context";
import { Button } from "@nook/app-ui";

export const AddCastButton = () => {
  const context = useCreateCast();
  context.addCast;
  return (
    <Button
      backgroundColor="$mauve12"
      color="$mauve1"
      padding="$0"
      paddingHorizontal="$0"
      paddingVertical="$0"
      height="$2"
      width="$2"
      borderRadius="$10"
      scaleIcon={1.25}
      icon={Plus}
      onPress={() => {
        context.addCast(context.activeIndex);
      }}
      pressStyle={{ backgroundColor: "$mauve11" }}
      disabled={context.activeCastLength === 0}
      disabledStyle={{ backgroundColor: "$mauve10" }}
      justifyContent="center"
      alignItems="center"
    />
  );
};
