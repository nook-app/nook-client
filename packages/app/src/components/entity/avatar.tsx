import { store } from "@/store";
import { selectEntityById } from "@/store/entity";
import { Avatar } from "tamagui";

export const EntityAvatar = ({
  entityId,
  size = "$3.5",
}: { entityId?: string; size?: string }) => {
  const entity = entityId
    ? selectEntityById(store.getState(), entityId.toString())
    : undefined;
  return (
    <Avatar circular size={size}>
      <Avatar.Image src={entity?.farcaster.pfp} />
      <Avatar.Fallback backgroundColor="$backgroundPress" />
    </Avatar>
  );
};
