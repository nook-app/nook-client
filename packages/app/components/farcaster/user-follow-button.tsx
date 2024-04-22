import { NookButton } from "@nook/ui";
import { useFollowUser } from "../../hooks/useFollowUser";

export const FarcasterUserFollowButton = ({ fid }: { fid: string }) => {
  const { user, isFollowing, followUser, unfollowUser, isViewer } =
    useFollowUser(fid);

  if (!user || isViewer) {
    return null;
  }

  return (
    <NookButton
      onPress={() => (isFollowing ? unfollowUser({}) : followUser({}))}
      variant={isFollowing ? "active-action" : "action"}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </NookButton>
  );
};
