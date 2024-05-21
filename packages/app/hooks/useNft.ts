import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "../store/useUserStore";
import { fetchUser } from "../api/farcaster";
import { useNftStore } from "../store/useNftStore";

export const useNft = (nftId: string) => {
  const storedNft = useNftStore((state) => state.nfts[nftId]);
  const addNfts = useNftStore((state) => state.addNfts);

  return { nft: storedNft };
};
