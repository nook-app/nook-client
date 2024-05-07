import { useCallback, useState } from "react";
import { FarcasterCast } from "@nook/common/types";
import { submitReactionAdd, submitReactionRemove } from "../server/farcaster";
import { useToastController } from "@nook/ui";
import { useCastStore } from "../store/useCastStore";

export const useRecastCast = (cast: FarcasterCast) => {
  const toast = useToastController();

  const storeCast = useCastStore((state) => state.casts[cast.hash]);
  const updateRecast = useCastStore((state) => state.recastCast);
  const updateUnrecast = useCastStore((state) => state.unrecastCast);

  const recastCast = useCallback(async () => {
    updateRecast(cast);
    try {
      const response = await submitReactionAdd({
        reactionType: 2,
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
    updateUnrecast(cast);
  }, [cast, updateRecast, updateUnrecast, toast]);

  const unrecastCast = useCallback(async () => {
    updateUnrecast(cast);
    try {
      const response = await submitReactionRemove({
        reactionType: 2,
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
    updateRecast(cast);
  }, [cast, updateRecast, updateUnrecast, toast]);

  return {
    recastCast,
    unrecastCast,
    isRecasted: storeCast?.context?.recasted ?? cast.context?.recasted ?? false,
  };
};
