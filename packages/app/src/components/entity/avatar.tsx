import { store } from "@/store";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { selectEntityById } from "@/store/slices/entity";
import { setActiveEntityModal } from "@/store/slices/user";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Avatar } from "tamagui";

export const EntityAvatar = ({
  entityId,
  size = "$3.5",
}: { entityId?: string; size?: string }) => {
  const dispatch = useAppDispatch();
  const entity = entityId
    ? selectEntityById(store.getState(), entityId.toString())
    : undefined;

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          dispatch(setActiveEntityModal(entity?._id.toString()));
        }}
      >
        <Avatar circular size={size}>
          <Avatar.Image src={entity?.farcaster.pfp} />
          <Avatar.Fallback backgroundColor="$backgroundPress" />
        </Avatar>
      </TouchableOpacity>
    </>
  );
};
