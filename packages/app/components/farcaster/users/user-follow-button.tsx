import { NookButton } from "@nook/ui";
import { useFollowUser } from "../../../hooks/useFollowUser";
import { FarcasterUser } from "../../../types";
import { useAuth } from "../../../context/auth";
import { EnableSignerDialog } from "../../../features/farcaster/enable-signer/dialog";

export const FarcasterUserFollowButton = ({
  user,
}: {
  user: FarcasterUser;
}) => {
  const { session, login, signer } = useAuth();
  const { followUser, unfollowUser, isFollowing, isViewer } =
    useFollowUser(user);

  if (isViewer) {
    return null;
  }

  return (
    <EnableSignerDialog>
      <NookButton
        onPress={(e) => {
          if (!session) {
            login();
            return;
          }
          if (!signer || signer?.state !== "completed") {
            return;
          }
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
    </EnableSignerDialog>
  );
};
