import { useCallback } from "react";
import { FarcasterCastV1 } from "@nook/common/types";
import {
  submitReactionAdd,
  submitReactionRemove,
} from "../api/farcaster/actions";
import { useToastController } from "@nook/app-ui";
import { useCastStore } from "../store/useCastStore";
import { haptics } from "../utils/haptics";

export const useRecastCast = (cast: FarcasterCastV1) => {
  const toast = useToastController();

  const storeCast = useCastStore((state) => state.casts[cast.hash]);
  const updateRecast = useCastStore((state) => state.recastCast);
  const updateUnrecast = useCastStore((state) => state.unrecastCast);

  const recastCast = useCallback(async () => {
    haptics.impactMedium();
    try {
      const response = await submitReactionAdd({
        reactionType: 2,
        targetFid: cast.user.fid,
        targetHash: cast.hash,
      });
      updateRecast(cast);
      if (!("message" in response)) {
        return;
      }
      toast.show(response.message);
    } catch (e) {
      toast.show("An error occurred. Try again.");
      haptics.notificationError();
    }
  }, [cast, updateRecast, toast]);

  const unrecastCast = useCallback(async () => {
    haptics.impactMedium();
    try {
      const response = await submitReactionRemove({
        reactionType: 2,
        targetFid: cast.user.fid,
        targetHash: cast.hash,
      });
      updateUnrecast(cast);
      if (!("message" in response)) {
        return;
      }
      toast.show(response.message);
    } catch (e) {
      toast.show("An error occurred. Try again.");
      haptics.notificationError();
    }
  }, [cast, updateUnrecast, toast]);

  return {
    recastCast,
    unrecastCast,
    isRecasted: storeCast?.context?.recasted ?? cast.context?.recasted ?? false,
  };
};
