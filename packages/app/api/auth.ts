import { Session } from "../types";
import { makeRequest } from "./utils";

export const loginUser = async (token: string): Promise<Session> => {
  return await makeRequest("/user/login/privy", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
