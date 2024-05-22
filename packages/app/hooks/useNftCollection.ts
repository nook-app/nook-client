import { useQuery } from "@tanstack/react-query";
import { useNftStore } from "../store/useNftStore";
import { fetchNftCollection } from "../api/nft";

export const useNftCollection = (collectionId: string) => {
  const storedCollection = useNftStore(
    (state) => state.collections[collectionId],
  );
  const addCollections = useNftStore((state) => state.addCollections);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["nftCollection", collectionId],
    queryFn: async () => {
      const collection = await fetchNftCollection(collectionId);
      if (collection) {
        addCollections([collection]);
      }
      return collection;
    },
    enabled: !storedCollection,
  });
  return { collection: storedCollection || data, isLoading, isError, error };
};
