import { Plus } from "@tamagui/lucide-icons";
import { NookButton } from "@nook/app-ui";
import { useCreateCast } from "./context";

export const AddCastButton = () => {
  const context = useCreateCast();
  context.addCast;
  return (
    <NookButton
      circular
      icon={Plus}
      scaleIcon={1.5}
      onPress={() => {
        context.addCast(context.activeIndex);
      }}
      disabled={context.activeCastLength === 0}
      disabledStyle={{ opacity: 0.5 }}
    />
  );
};
