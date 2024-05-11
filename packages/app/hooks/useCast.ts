import { useQuery } from "@tanstack/react-query";
import { fetchCast } from "../api/farcaster";
import { useCastStore } from "../store/useCastStore";

export const useCast = (hash: string, skipCache = false) => {
  const storedCast = useCastStore((state) => state.casts[hash]);
  const addCasts = useCastStore((state) => state.addCasts);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["cast", hash],
    queryFn: async () => {
      const cast = await fetchCast(hash);
      if (cast) {
        addCasts([cast]);
      }
      return cast;
    },
    enabled: skipCache || !storedCast,
  });

  return {
    cast: skipCache ? data : storedCast || data,
    isLoading,
    isError,
    error,
  };
};
