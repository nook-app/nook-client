import { create } from "zustand";
import { SimpleHashNFT, SimpleHashCollection } from "@nook/common/types";

interface NftStore {
  nfts: Record<string, SimpleHashNFT>;
  collections: Record<string, SimpleHashCollection>;
  addNfts: (nfts: SimpleHashNFT[]) => void;
  addCollections: (collections: SimpleHashCollection[]) => void;
}

export const useNftStore = create<NftStore>((set, get) => ({
  nfts: {},
  collections: {},
  addNfts: (nfts: SimpleHashNFT[]) => {
    const currentNfts = get().nfts;
    const currentCollections = get().collections;
    const newNfts = nfts.reduce(
      (acc, nft) => {
        if (acc[nft.nft_id]) return acc;
        acc[nft.nft_id] = nft;
        return acc;
      },
      {} as Record<string, SimpleHashNFT>,
    );
    const newCollections = nfts.reduce(
      (acc, nft) => {
        if (!nft.collection.collection_id) return acc;
        if (acc[nft.collection.collection_id]) return acc;
        acc[nft.collection.collection_id] = nft.collection;
        return acc;
      },
      {} as Record<string, SimpleHashCollection>,
    );
    set({
      nfts: { ...currentNfts, ...newNfts },
      collections: { ...currentCollections, ...newCollections },
    });
  },
  addCollections: (collections: SimpleHashCollection[]) => {
    const currentCollections = get().collections;
    const newCollections = collections.reduce(
      (acc, collection) => {
        if (!collection.collection_id) return acc;
        if (acc[collection.collection_id]) return acc;
        acc[collection.collection_id] = collection;
        return acc;
      },
      {} as Record<string, SimpleHashCollection>,
    );
    set({
      collections: { ...currentCollections, ...newCollections },
    });
  },
}));
