import { useQuery } from "@tanstack/react-query";
import { fetchCast } from "../api/farcaster";
import { useCastStore } from "../store/useCastStore";

export const useCast = (hash: string) => {
  const storedCast = useCastStore((state) => state.casts[hash]);
  const addCasts = useCastStore((state) => state.addCasts);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["cast", hash],
    queryFn: async () => {
      const Cast = await fetchCast(hash);
      if (Cast) {
        addCasts([Cast]);
      }
      return Cast;
    },
    enabled: !storedCast,
  });

  return { cast: storedCast || data, isLoading, isError, error };
};
