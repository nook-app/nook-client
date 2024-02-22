import { store } from "@/store";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { selectEntityById } from "@/store/slices/entity";
import { openModal } from "@/store/slices/navigator";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Avatar } from "tamagui";
import { useCallback } from "react";
import { ModalName } from "@/modals/types";

export const EntityAvatar = ({
  entityId,
  size = "$3.5",
}: { entityId: string; size?: string }) => {
  const dispatch = useAppDispatch();
  const entity = selectEntityById(store.getState(), entityId.toString());

  const onPress = useCallback(async () => {
    dispatch(
      openModal({
        name: ModalName.Entity,
        initialState: {
          entityId: entityId,
        },
      }),
    );
  }, [dispatch, entityId]);

  return (
    <TouchableOpacity onPress={onPress}>
      <Avatar circular size={size}>
        <Avatar.Image src={entity?.farcaster.pfp} />
        <Avatar.Fallback backgroundColor="$backgroundPress" />
      </Avatar>
    </TouchableOpacity>
  );
};
