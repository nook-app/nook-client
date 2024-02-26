import { selectEntityById } from "@/store/slices/entity";
import { useAppSelector } from "./useAppSelector";
import { Entity } from "@nook/common/types";

const getDisplayName = (entity?: Entity) => {
  if (!entity) return "Unknown";
  if (entity.farcaster?.displayName) {
    return entity.farcaster.displayName;
  }
  return entity.farcaster?.fid ? `fid:${entity.farcaster.fid}` : "Unknown";
};

const getUsername = (entity?: Entity) => {
  if (!entity) return "@unknown";
  if (entity.farcaster?.username) {
    return `@${entity.farcaster.username}`;
  }
  return entity.farcaster?.fid ? `fid:${entity.farcaster.fid}` : "@unknown";
};

export const useEntity = (entityId?: string) => {
  const entity = useAppSelector((state) =>
    entityId ? selectEntityById(state, entityId) : undefined,
  );

  return {
    entity: entity?.entity,
    context: entity?.context,
    displayName: getDisplayName(entity?.entity),
    username: getUsername(entity?.entity),
    bio: entity?.entity?.farcaster?.bio,
    following: entity?.entity?.farcaster?.following || 0,
    followers: entity?.entity?.farcaster?.followers || 0,
  };
};
