import { useQuery } from "@tanstack/react-query";
import { useTokenStore } from "../store/useTokenStore";
import { fetchToken } from "../api/token";

export const useToken = (tokenId: string) => {
  const storedToken = useTokenStore((state) => state.tokens[tokenId]);
  const addTokens = useTokenStore((state) => state.addTokens);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["token", tokenId],
    queryFn: async () => {
      const token = await fetchToken(tokenId);
      if (token) {
        addTokens([token]);
      }
      return token;
    },
    enabled: !storedToken,
  });
  return { token: storedToken || data, isLoading, isError, error };
};
