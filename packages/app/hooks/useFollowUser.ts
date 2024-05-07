import { useCallback, useState } from "react";
import { FarcasterUser } from "@nook/common/types";
import { submitLinkAdd, submitLinkRemove } from "../server/farcaster";
import { useUserStore } from "../store/useUserStore";
import { useToastController } from "@nook/ui";

export const useFollowUser = (user: FarcasterUser) => {
  const toast = useToastController();

  const storeUser = useUserStore(
    (state) => state.users[user.username || user.fid],
  );
  const updateFollow = useUserStore((state) => state.followUser);
  const updateUnfollow = useUserStore((state) => state.unfollowUser);

  const followUser = useCallback(async () => {
    updateFollow(user);
    try {
      const response = await submitLinkAdd({
        linkType: "follow",
        targetFid: user.fid,
        username: user.username,
      });
      if (!("message" in response)) {
        return;
      }
      toast.show(response.message);
    } catch (e) {
      toast.show("An error occurred. Try again later.");
    }
    updateUnfollow(user);
  }, [user, updateFollow, updateUnfollow, toast]);

  const unfollowUser = useCallback(async () => {
    updateUnfollow(user);
    try {
      const response = await submitLinkRemove({
        linkType: "follow",
        targetFid: user.fid,
        username: user.username,
      });
      if (!("message" in response)) {
        return;
      }
      toast.show(response.message);
    } catch (e) {
      toast.show("An error occurred. Try again later.");
    }
    updateFollow(user);
  }, [user, updateFollow, updateUnfollow, toast]);

  return {
    followUser,
    unfollowUser,
    isFollowing:
      storeUser?.context?.following ?? user.context?.following ?? false,
  };
};
