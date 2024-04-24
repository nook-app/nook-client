import { useCallback } from "react";
import { useUser } from "../api/farcaster";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/auth";
import { FarcasterUser } from "../types";
import { submitLinkAdd, submitLinkRemove } from "../api/farcaster/actions";

export const useFollowUser = (username: string) => {
  const queryClient = useQueryClient();
  const { data } = useUser(username);
  const { user } = useAuth();

  const incrementFollow = useCallback(
    (user: FarcasterUser, increment: number) => {
      queryClient.setQueryData(["user", user.fid], {
        ...user,
        engagement: {
          ...user.engagement,
          followers: user.engagement.followers + increment,
        },
        context: {
          ...user.context,
          following: increment > 0,
        },
      });
    },
    [queryClient],
  );

  const followUser = useCallback(
    async ({
      onSucess,
      onError,
    }: { onSucess?: () => void; onError?: (error: string) => void }) => {
      if (!user || !data) return;

      incrementFollow(data, 1);

      try {
        const response = await submitLinkAdd({
          linkType: "follow",
          targetFid: data.fid,
        });
        if ("message" in response) {
          onError?.(response.message);
        } else {
          onSucess?.();
          return;
        }
      } catch (e) {
        onError?.("An error occurred. Try again later.");
      }

      incrementFollow(data, -1);
    },
    [incrementFollow, user, data],
  );

  const unfollowUser = useCallback(
    async ({
      onSucess,
      onError,
    }: { onSucess?: () => void; onError?: (error: string) => void }) => {
      if (!user || !data) return;

      incrementFollow(data, -1);

      try {
        const response = await submitLinkRemove({
          linkType: "follow",
          targetFid: data.fid,
        });
        if ("message" in response) {
          onError?.(response.message);
        } else {
          onSucess?.();
          return;
        }
      } catch (e) {
        onError?.("An error occurred. Try again later.");
      }

      incrementFollow(data, 1);
    },
    [incrementFollow, user, data],
  );

  return {
    user: data,
    followUser,
    unfollowUser,
    isFollowing: data?.context?.following,
    isFollower: data?.context?.followers,
    isMutual: data?.context?.following && data?.context?.followers,
    isViewer: !user || data?.fid === user?.fid,
  };
};
