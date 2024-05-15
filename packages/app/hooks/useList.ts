import { useQuery } from "@tanstack/react-query";
import { fetchList } from "../api/list";
import { useListStore } from "../store/useListStore";

export const useList = (listId: string) => {
  const storedList = useListStore((state) => state.lists[listId]);
  const addLists = useListStore((state) => state.addLists);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["list", listId],
    queryFn: async () => {
      const list = await fetchList(listId);
      addLists([list]);
      return list;
    },
    enabled: !storedList,
  });

  return { list: storedList || data, isLoading, isError, error };
};
