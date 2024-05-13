import { useCallback } from "react";
import { FarcasterCastResponse } from "@nook/common/types";
import {
  submitReactionAdd,
  submitReactionRemove,
} from "../api/farcaster/actions";
import { useToastController } from "@nook/app-ui";
import { useCastStore } from "../store/useCastStore";
import { haptics } from "../utils/haptics";

export const useLikeCast = (cast: FarcasterCastResponse) => {
  const toast = useToastController();

  const storeCast = useCastStore((state) => state.casts[cast.hash]);
  const updateLike = useCastStore((state) => state.likeCast);
  const updateUnlike = useCastStore((state) => state.unlikeCast);

  const likeCast = useCallback(async () => {
    updateLike(cast);
    haptics.notificationSuccess();
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
      toast.show("An error occurred. Try again.");
      haptics.notificationError();
    }
    updateUnlike(cast);
  }, [cast, updateLike, updateUnlike, toast]);

  const unlikeCast = useCallback(async () => {
    updateUnlike(cast);
    haptics.notificationSuccess();
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
      toast.show("An error occurred. Try again.");
      haptics.notificationError();
    }
    updateLike(cast);
  }, [cast, updateLike, updateUnlike, toast]);

  return {
    likeCast,
    unlikeCast,
    isLiked: storeCast?.context?.liked ?? cast.context?.liked ?? false,
  };
};
