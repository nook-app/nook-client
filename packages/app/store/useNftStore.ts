import { create } from "zustand";
import { SimpleHashNFT } from "@nook/common/types";

interface NftStore {
  nfts: Record<string, SimpleHashNFT>;
  addNfts: (nfts: SimpleHashNFT[]) => void;
}

export const useNftStore = create<NftStore>((set, get) => ({
  nfts: {},
  addNfts: (nfts: SimpleHashNFT[]) => {
    const currentNfts = get().nfts;
    const newNfts = nfts.reduce(
      (acc, nft) => {
        if (acc[nft.nft_id]) return acc;
        acc[nft.nft_id] = nft;
        return acc;
      },
      {} as Record<string, SimpleHashNFT>,
    );
    set({ nfts: { ...currentNfts, ...newNfts } });
  },
}));
