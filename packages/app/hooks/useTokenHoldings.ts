import { useQuery } from "@tanstack/react-query";
import { useTokenStore } from "../store/useTokenStore";
import { fetchTokenHoldings } from "../api/token";

export const useTokenHoldings = (fid: string) => {
  const storedTokenHoldings = useTokenStore(
    (state) => state.tokenHoldings[fid],
  );
  const addTokenHoldings = useTokenStore((state) => state.addTokenHoldings);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tokenHoldings", fid],
    queryFn: async () => {
      const holdings = await fetchTokenHoldings({ fid });
      if (holdings) {
        addTokenHoldings([holdings]);
      }
      return holdings;
    },
    enabled: !storedTokenHoldings,
  });
  return {
    tokenHoldings: storedTokenHoldings || data,
    isLoading,
    isError,
    error,
  };
};
