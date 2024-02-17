import { Entity } from "@flink/common/types";
import { Avatar } from "tamagui";

export const EntityAvatar = ({
  entity,
  size = "$3.5",
}: { entity?: Entity; size?: string }) => {
  return (
    <Avatar circular size={size}>
      <Avatar.Image src={entity?.farcaster.pfp} />
      <Avatar.Fallback backgroundColor="$backgroundPress" />
    </Avatar>
  );
};
