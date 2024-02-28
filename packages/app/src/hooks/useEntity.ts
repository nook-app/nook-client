import { selectEntityById } from "@/store/slices/entity";
import { useAppSelector } from "./useAppSelector";
import { EntityWithRelations } from "@nook/common/types";
import { EntityFarcaster } from "@nook/common/prisma/entity";

const getDisplayName = (farcaster: EntityFarcaster) => {
  return farcaster.displayName || `fid:${farcaster.fid}`;
};

const getUsername = (farcaster: EntityFarcaster) => {
  return farcaster.username ? `@${farcaster.username}` : `fid:${farcaster.fid}`;
};

export const useEntity = (entityId: string) => {
  const entity = useAppSelector((state) => selectEntityById(state, entityId));

  const farcaster = entity?.farcasterAccounts?.[0];
  const displayName = farcaster ? getDisplayName(farcaster) : "Unknown";
  const username = farcaster ? getUsername(farcaster) : "@unknown";

  return {
    entity,
    displayName,
    username,
    bio: farcaster?.bio,
    url: farcaster?.url,
    pfp: farcaster?.pfp,
    farcaster,
    following: 0,
    followers: 0,
  };
};
