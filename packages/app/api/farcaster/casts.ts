import { FarcasterCast } from "../../types";
import { makeRequest } from "../utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const fetchCast = async (hash: string, requestInit?: RequestInit) => {
  return await makeRequest(`/farcaster/casts/${hash}`, requestInit);
};

export const useCast = (hash: string) => {
  const queryClient = useQueryClient();
  const initialData = queryClient.getQueryData<FarcasterCast>(["cast", hash]);
  return useQuery({
    queryKey: ["cast", hash],
    queryFn: async () => {
      const cast = await fetchCast(hash);
      return cast;
    },
    initialData,
    enabled: !initialData && !!hash,
  });
};
