import { useQuery } from "@tanstack/react-query";
import { useNftStore } from "../store/useNftStore";
import { fetchNft } from "../api/nft";

export const useNft = (nftId: string) => {
  const storedNft = useNftStore((state) => state.nfts[nftId]);
  const addNfts = useNftStore((state) => state.addNfts);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["nft", nftId],
    queryFn: async () => {
      const nft = await fetchNft(nftId);
      if (nft) {
        addNfts([nft]);
      }
      return nft;
    },
    enabled: !storedNft,
  });
  return { nft: storedNft || data, isLoading, isError, error };
};
