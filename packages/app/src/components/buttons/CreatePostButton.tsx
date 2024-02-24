import { useModal } from "@/hooks/useModal";
import { ModalName } from "@/modals/types";
import { Plus } from "@tamagui/lucide-icons";
import { useCallback } from "react";
import { View } from "tamagui";

export const CreatePostButton = () => {
  const { open } = useModal(ModalName.CreatePost);
  const onPress = useCallback(() => open(), [open]);

  return (
    <View
      onPress={onPress}
      position="absolute"
      bottom="$5"
      right="$5"
      zIndex={1}
      borderRadius="$20"
      padding="$3"
      backgroundColor="$color7"
      pressStyle={{
        backgroundColor: "$color8",
        padding: "$2.5",
      }}
      animation="bouncy"
    >
      <Plus size={24} color="$gray12" />
    </View>
  );
};
