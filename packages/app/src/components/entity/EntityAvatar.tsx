import { TouchableOpacity } from "react-native-gesture-handler";
import { Avatar } from "tamagui";
import { useCallback } from "react";
import { ModalName } from "@/modals/types";
import { useModal } from "@/hooks/useModal";
import { useEntity } from "@/hooks/useEntity";

export const EntityAvatar = ({
  entityId,
  size = "$3.5",
}: { entityId: string; size?: string }) => {
  const entity = useEntity(entityId);
  const { open } = useModal(ModalName.Entity);

  const onPress = useCallback(() => {
    open({ entityId });
  }, [open, entityId]);

  return (
    <TouchableOpacity onPress={onPress}>
      <Avatar circular size={size}>
        <Avatar.Image src={entity?.farcaster.pfp} />
        <Avatar.Fallback backgroundColor="$backgroundPress" />
      </Avatar>
    </TouchableOpacity>
  );
};
