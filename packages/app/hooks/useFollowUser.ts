import { useCallback, useState } from "react";
import { useAuth } from "../context/auth";
import { FarcasterUser } from "../types";
import { submitLinkAdd, submitLinkRemove } from "../server/farcaster";

export const useFollowUser = (user: FarcasterUser) => {
  const [isFollowing, setIsFollowing] = useState<boolean>(
    user.context?.following ?? false,
  );
  const { session } = useAuth();

  const followUser = useCallback(
    async ({
      onSucess,
      onError,
    }: { onSucess?: () => void; onError?: (error: string) => void }) => {
      setIsFollowing(true);
      try {
        const response = await submitLinkAdd({
          linkType: "follow",
          targetFid: user.fid,
          username: user.username,
        });
        if (!("message" in response)) {
          onSucess?.();
          return;
        }
        onError?.(response.message);
      } catch (e) {
        onError?.("An error occurred. Try again later.");
      }
      setIsFollowing(false);
    },
    [user],
  );

  const unfollowUser = useCallback(
    async ({
      onSucess,
      onError,
    }: { onSucess?: () => void; onError?: (error: string) => void }) => {
      setIsFollowing(false);
      try {
        const response = await submitLinkRemove({
          linkType: "follow",
          targetFid: user.fid,
          username: user.username,
        });
        if (!("message" in response)) {
          onSucess?.();
          return;
        }
        onError?.(response.message);
      } catch (e) {
        onError?.("An error occurred. Try again later.");
      }
      setIsFollowing(true);
    },
    [user],
  );

  return {
    followUser,
    unfollowUser,
    isFollowing,
    isViewer: !session || user.fid === session?.fid,
  };
};
