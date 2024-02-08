import { Entity } from "@flink/common/types";
import { Image, Avatar as TAvatar } from "tamagui";

export const Avatar = ({
  entity,
  size = "$3.5",
}: { entity: Entity; size?: string }) => {
  return (
    <TAvatar circular size={size}>
      <TAvatar.Image src={entity.farcaster.pfp} />
      <TAvatar.Fallback />
    </TAvatar>
  );
};
