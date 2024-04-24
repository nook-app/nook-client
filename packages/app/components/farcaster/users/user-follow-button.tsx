import { NookButton } from "@nook/ui";
import { useFollowUser } from "../../../hooks/useFollowUser";

export const FarcasterUserFollowButton = ({
  username,
}: { username: string }) => {
  const { user, isFollowing, followUser, unfollowUser, isViewer } =
    useFollowUser(username);

  console.log(user, isViewer);

  if (!user || isViewer) {
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
