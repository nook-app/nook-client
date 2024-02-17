import { CONFIG } from "@/constants";
import * as SecureStore from "expo-secure-store";
import { Session } from "./session";
import { Nook } from "@flink/api/data";

export type SignInParams = {
  message: string;
  nonce: string;
  signature: string;
};

export const getAuthorizationToken = async () => {
  const { token }: Session = JSON.parse(
    (await SecureStore.getItemAsync("session")) as string,
  );
  return token ? `Bearer ${token}` : "";
};

export const signInWithFarcaster = async (params: SignInParams) => {
  const response = await fetch(`${CONFIG.apiBaseUrl}/auth/farcaster`, {
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

export const refreshToken = async (token: string) => {
  const response = await fetch(`${CONFIG.apiBaseUrl}/token`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as Session;
};

export const getUserData = async (session: Session) => {
  const response = await fetch(`${CONFIG.apiBaseUrl}/nooks`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as { nooks: Nook[] };
};
