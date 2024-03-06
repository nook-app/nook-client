import { selectUserById } from "@/store/slices/user";
import { useAppSelector } from "./useAppSelector";
import { formatToWarpcastCDN } from "@/utils";

export const useUser = (userId: string) => {
  const user = useAppSelector((state) => selectUserById(state, userId));

  const displayName =
    user?.farcaster.displayName || `fid:${user?.farcaster.fid}`;
  const username = user?.farcaster.username
    ? `@${user.farcaster.username}`
    : `fid:${user.farcaster.fid}`;

  const bio = user?.farcaster.bio?.replace(/\n\s*\n/g, "\n");

  return {
    fid: user?.farcaster?.fid,
    displayName,
    username,
    bio: bio,
    url: user?.farcaster.url,
    pfp: formatToWarpcastCDN(user?.farcaster?.pfp, 168),
    following: user?.farcaster?.engagement?.following || 0,
    followers: user?.farcaster?.engagement?.followers || 0,
    context: user?.farcaster?.context,
  };
};
