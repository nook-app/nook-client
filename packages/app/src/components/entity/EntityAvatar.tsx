import { Avatar } from "tamagui";
import { useEntity } from "@/hooks/useEntity";
import { EntityModalButton } from "./EntityModalButton";

export const EntityAvatar = ({
  entityId,
  size = "$3.5",
}: { entityId: string; size?: string }) => {
  const entity = useEntity(entityId);
  return (
    <EntityModalButton entityId={entityId}>
      <Avatar circular size={size}>
        <Avatar.Image src={entity?.farcaster.pfp} />
        <Avatar.Fallback backgroundColor="$backgroundPress" />
      </Avatar>
    </EntityModalButton>
  );
};
