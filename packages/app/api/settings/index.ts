import { User } from "../../types";
import { makeRequest } from "../utils";
import { useQuery } from "@tanstack/react-query";

export const fetchSettings = async () => {
  return makeRequest("/user");
};

export const useSettings = () => {
  return useQuery<User>({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });
};
