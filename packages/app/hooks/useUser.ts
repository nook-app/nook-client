import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "../store/useUserStore";
import { fetchUser } from "../api/farcaster";

export const useUser = (username: string) => {
  const storedUser = useUserStore((state) => state.users[username]);
  const addUsers = useUserStore((state) => state.addUsers);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["user", username],
    queryFn: async () => {
      const user = await fetchUser(username);
      if (user) {
        addUsers([user]);
      }
      return user;
    },
    enabled: !storedUser,
  });

  return { user: storedUser || data, isLoading, isError, error };
};
