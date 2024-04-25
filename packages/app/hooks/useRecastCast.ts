import { useCallback, useState } from "react";
import { FarcasterCast } from "../types";
import { submitReactionAdd, submitReactionRemove } from "../server/farcaster";

export const useRecastCast = (cast: FarcasterCast) => {
  const [isRecasted, setIsRecasted] = useState(cast.context?.recasted ?? false);

  const recastCast = useCallback(
    async ({
      onSucess,
      onError,
    }: { onSucess?: () => void; onError?: (error: string) => void }) => {
      setIsRecasted(true);
      try {
        const response = await submitReactionAdd({
          reactionType: 2,
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
      setIsRecasted(false);
    },
    [cast],
  );

  const unrecastCast = useCallback(
    async ({
      onSucess,
      onError,
    }: { onSucess?: () => void; onError?: (error: string) => void }) => {
      setIsRecasted(false);
      try {
        const response = await submitReactionRemove({
          reactionType: 2,
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
      setIsRecasted(true);
    },
    [cast],
  );

  return {
    recastCast,
    unrecastCast,
    isRecasted,
  };
};
