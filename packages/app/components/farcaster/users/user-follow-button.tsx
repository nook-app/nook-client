import { NookButton } from "@nook/ui";
import { useFollowUser } from "../../../hooks/useFollowUser";
import { FarcasterUser } from "../../../types";

export const FarcasterUserFollowButton = ({
  user,
}: {
  user: FarcasterUser;
}) => {
  const { followUser, unfollowUser, isFollowing, isViewer } =
    useFollowUser(user);

  if (isViewer) {
    return null;
  }

  return (
    <NookButton
      onPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isFollowing) {
          unfollowUser({});
        } else {
          followUser({});
        }
      }}
      variant={isFollowing ? "active-action" : "action"}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </NookButton>
  );
};
