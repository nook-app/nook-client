import * as SecureStore from "expo-secure-store";
import { CONFIG } from "@/constants";
import { Entity } from "@flink/common/types";

export type Session = {
  token: string;
  refreshToken: string;
  expiresAt: number;
  entity: Entity;
};

const SESSION_KEY = "session";
const ONE_DAY = 24 * 60 * 60;

export const getSession = async () => {
  const sessionJson = await SecureStore.getItemAsync(SESSION_KEY);
  if (sessionJson) {
    const session = JSON.parse(sessionJson) as Session;
    if (session.expiresAt - Math.floor(Date.now() / 1000) < ONE_DAY) {
      return await refreshSession(session);
    }
    return session;
  }
};

export const updateSession = async (session: Session) => {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  return session;
};

export const removeSession = async () => {
  await SecureStore.deleteItemAsync(SESSION_KEY);
};

export const refreshSession = async (existingSession?: Session) => {
  const session = existingSession || (await getSession());
  if (!session) return;

  try {
    const newSession = {
      ...session,
      ...(await refreshToken(session)),
    } as Session;
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(newSession));
    return newSession;
  } catch (e) {
    console.error(e);
  }
};

export const refreshToken = async (session: Session) => {
  const response = await fetch(`${CONFIG.apiBaseUrl}/user/token`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as Session;
};
