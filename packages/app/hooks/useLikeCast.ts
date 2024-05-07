import { useCallback } from "react";
import { FarcasterCast } from "@nook/common/types";
import { submitReactionAdd, submitReactionRemove } from "../server/farcaster";
import { useToastController } from "@nook/ui";
import { useCastStore } from "../store/useCastStore";

export const useLikeCast = (cast: FarcasterCast) => {
  const toast = useToastController();

  const storeCast = useCastStore((state) => state.casts[cast.hash]);
  const updateLike = useCastStore((state) => state.likeCast);
  const updateUnlike = useCastStore((state) => state.unlikeCast);

  const likeCast = useCallback(async () => {
    updateLike(cast);
    try {
      const response = await submitReactionAdd({
        reactionType: 1,
        targetFid: cast.user.fid,
        targetHash: cast.hash,
      });
      if (!("message" in response)) {
        return;
      }
      toast.show(response.message);
    } catch (e) {
      toast.show("An error occurred. Try again later.");
    }
    updateUnlike(cast);
  }, [cast, updateLike, updateUnlike, toast]);

  const unlikeCast = useCallback(async () => {
    updateUnlike(cast);
    try {
      const response = await submitReactionRemove({
        reactionType: 1,
        targetFid: cast.user.fid,
        targetHash: cast.hash,
      });
      if (!("message" in response)) {
        return;
      }
      toast.show(response.message);
    } catch (e) {
      toast.show("An error occurred. Try again later.");
    }
    updateLike(cast);
  }, [cast, updateLike, updateUnlike, toast]);

  return {
    likeCast,
    unlikeCast,
    isLiked: storeCast?.context?.liked ?? cast.context?.liked ?? false,
  };
};
