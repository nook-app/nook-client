import { selectEntityById } from "@/store/slices/entity";
import { useAppSelector } from "./useAppSelector";
import { EntityResponse } from "@nook/common/types";
import { formatToWarpcastCDN } from "@/utils";

const getDisplayName = ({ farcaster }: EntityResponse) => {
  return farcaster.displayName || `fid:${farcaster.fid}`;
};

const getUsername = ({ farcaster }: EntityResponse) => {
  return farcaster.username ? `@${farcaster.username}` : `fid:${farcaster.fid}`;
};

export const useEntity = (entityId: string) => {
  const entity = useAppSelector((state) => selectEntityById(state, entityId));

  const displayName = entity ? getDisplayName(entity) : "Unknown";
  const username = entity ? getUsername(entity) : "@unknown";

  return {
    entity,
    displayName,
    username,
    bio: entity?.farcaster?.bio,
    url: entity?.farcaster?.url,
    pfp: formatToWarpcastCDN(entity?.farcaster?.pfp, 168),
    farcaster: entity?.farcaster,
    following: 0,
    followers: 0,
  };
};
