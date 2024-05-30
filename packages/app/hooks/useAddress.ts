import { useUserStore } from "../store/useUserStore";
import { useQuery } from "@tanstack/react-query";
import { makeUrlRequest } from "../api/utils";
import { useUsersByAddress } from "./api/users";

export const useAddress = (address: string) => {
  const storedUser = useUserStore((state) => state.addresses[address]);
  const { data, isLoading, isError, error } = useUsersByAddress([
    address.toLowerCase(),
  ]);

  const user = storedUser || data?.data[0];
  const { data: ens } = useEns(address, !user);

  return {
    address,
    user,
    ens,
    isLoading,
    isError,
    error,
  };
};

export const useEns = (address: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["ens", address],
    queryFn: async () => {
      const response = await makeUrlRequest(`https://ensdata.net/${address}`);
      return response || null;
    },
    enabled,
  });
};
