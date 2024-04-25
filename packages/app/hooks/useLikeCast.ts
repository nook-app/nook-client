import { useCallback, useState } from "react";
import { FarcasterCast } from "../types";
import { submitReactionAdd, submitReactionRemove } from "../server/farcaster";

export const useLikeCast = (cast: FarcasterCast) => {
  const [isLiked, setIsLiked] = useState(cast.context?.liked ?? false);

  const likeCast = useCallback(
    async ({
      onSucess,
      onError,
    }: { onSucess?: () => void; onError?: (error: string) => void }) => {
      setIsLiked(true);
      try {
        const response = await submitReactionAdd({
          reactionType: 1,
          targetFid: cast.user.fid,
          targetHash: cast.hash,
        });
        if (!("message" in response)) {
          onSucess?.();
          return;
        }
        onError?.(response.message);
      } catch (e) {
        onError?.("An error occurred. Try again later.");
      }
      setIsLiked(false);
    },
    [cast],
  );

  const unlikeCast = useCallback(
    async ({
      onSucess,
      onError,
    }: { onSucess?: () => void; onError?: (error: string) => void }) => {
      setIsLiked(false);
      try {
        const response = await submitReactionRemove({
          reactionType: 1,
          targetFid: cast.user.fid,
          targetHash: cast.hash,
        });
        if (!("message" in response)) {
          onSucess?.();
          return;
        }
        onError?.(response.message);
      } catch (e) {
        onError?.("An error occurred. Try again later.");
      }
      setIsLiked(true);
    },
    [cast],
  );

  return {
    likeCast,
    unlikeCast,
    isLiked,
  };
};
