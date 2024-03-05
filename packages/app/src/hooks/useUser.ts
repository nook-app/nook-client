import { selectUserById } from "@/store/slices/user";
import { useAppSelector } from "./useAppSelector";
import { formatToWarpcastCDN } from "@/utils";

export const useUser = (userId: string) => {
  const user = useAppSelector((state) => selectUserById(state, userId));

  const displayName = user?.displayName || `fid:${userId}`;
  const username = user?.username ? `@${user.username}` : `fid:${userId}`;

  return {
    fid: userId,
    displayName,
    username,
    bio: user?.bio,
    url: user?.url,
    pfp: formatToWarpcastCDN(user?.pfp, 168),
    following: user?.engagement?.following || 0,
    followers: user?.engagement?.followers || 0,
  };
};
