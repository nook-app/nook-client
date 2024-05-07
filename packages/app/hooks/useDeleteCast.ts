import { useCallback, useState } from "react";
import { FarcasterCast } from "@nook/common/types";
import { useToastController } from "@nook/ui";
import { useAuth } from "../context/auth";
import { useMuteStore } from "../store/useMuteStore";
import { submitCastRemove } from "../server/farcaster";
import { fetchCast } from "../api/farcaster";
import { useParams, useRouter } from "solito/navigation";

export const useDeleteCast = (cast: FarcasterCast) => {
  const { session, login } = useAuth();
  const toast = useToastController();
  const [isDeleting, setIsDeleting] = useState(false);

  const params = useParams();
  const router = useRouter();

  const storeCast = useMuteStore((state) => state.casts[cast.hash]);
  const updateDelete = useMuteStore((state) => state.deleteCast);

  const handleDeleteCast = useCallback(async () => {
    if (!session) {
      login();
      return;
    }

    setIsDeleting(true);
    updateDelete(cast);
    try {
      await submitCastRemove({
        hash: cast.hash,
      });

      const maxAttempts = 60;

      let response;
      let currentAttempts = 0;
      while (currentAttempts < maxAttempts && response) {
        currentAttempts++;
        response = await fetchCast(cast.hash);
        if (!response) break;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      if (response) {
        setIsDeleting(false);
        toast.show("Failed to refresh");
        return;
      }

      setIsDeleting(false);
      toast.show("Cast deleted");

      if (params.hash === cast.hash) {
        router.push("/");
      }
    } catch (e) {
      toast.show("An error occurred. Try again later.");
    }
  }, [cast, updateDelete, toast, session, login, router, params.hash]);

  return {
    deleteCast: handleDeleteCast,
    isDeleted: storeCast ?? false,
    isDeleting,
  };
};
