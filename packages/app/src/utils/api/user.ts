import { CONFIG } from "@/constants";
import { Session } from "../session";
import { GetUserResponse } from "@flink/api/types";

export type SignInParams = {
  message: string;
  nonce: string;
  signature: string;
};

export const signInWithFarcaster = async (params: SignInParams) => {
  const response = await fetch(`${CONFIG.apiBaseUrl}/user/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as Session;
};

export const getUserData = async (session: Session) => {
  const response = await fetch(`${CONFIG.apiBaseUrl}/user`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as GetUserResponse;
};
