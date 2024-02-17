import { User } from "@flink/common/prisma/nook";
import { Entity } from "@flink/common/types";
import * as SecureStore from "expo-secure-store";
import { SignInParams, refreshToken, signInWithFarcaster } from "./api";

export type Session = {
  user: User;
  entity: Entity;
  token: string;
  refreshToken: string;
  expiresAt: number;
};

const SESSION_KEY = "session";
const ONE_DAY = 24 * 60 * 60;

export const getSession = async () => {
  const sessionJson = await SecureStore.getItemAsync(SESSION_KEY);
  if (sessionJson) {
    const session = JSON.parse(sessionJson) as Session;
    if (session.expiresAt - Math.floor(Date.now() / 1000) < ONE_DAY) {
      return await updateSession(session);
    }
  }
};

export const fetchSession = async (params: SignInParams) => {
  const session = await signInWithFarcaster(params);
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  return session;
};

export const removeSession = async () => {
  await SecureStore.deleteItemAsync(SESSION_KEY);
};

export const updateSession = async (existingSession?: Session) => {
  const session = existingSession || (await getSession());
  if (!session) return;

  try {
    const newSession = {
      ...session,
      ...(await refreshToken(session.token)),
    } as Session;
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(newSession));
    return newSession;
  } catch (e) {
    console.error(e);
  }
};
