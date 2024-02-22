import { useAppDispatch } from "@/hooks/useAppDispatch";
import { ModalName } from "@/modals/types";
import { openModal } from "@/store/slices/navigator";
import { Plus } from "@tamagui/lucide-icons";
import { View } from "tamagui";

export const CreatePostButton = () => {
  const dispatch = useAppDispatch();

  const onPress = () => {
    dispatch(
      openModal({
        name: ModalName.CreatePost,
        initialState: undefined,
      }),
    );
  };

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
