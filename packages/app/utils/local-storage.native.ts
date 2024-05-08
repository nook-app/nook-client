import { Session } from "@nook/common/types";
import * as SecureStore from "expo-secure-store";

export const getSessions = async (): Promise<Session[]> => {
  const rawSessions = await SecureStore.getItemAsync("sessions");
  return rawSessions ? JSON.parse(rawSessions) : [];
};

export const getSession = async (): Promise<Session | undefined> => {
  const rawSession = await SecureStore.getItemAsync("session");
  return rawSession ? JSON.parse(rawSession) : undefined;
};

export const removeSession = async (session: Session): Promise<Session[]> => {
  await SecureStore.deleteItemAsync("session");
  const sessions = await getSessions();
  const remainingSessions = sessions.filter(
    (s: Session) => s.fid !== session.fid,
  );
  await SecureStore.setItemAsync("sessions", JSON.stringify(remainingSessions));
  return remainingSessions;
};

export const updateSession = async (session: Session) => {
  await SecureStore.setItemAsync("session", JSON.stringify(session));
  const sessions = await getSessions();
  if (sessions.some((s: Session) => s.fid === session.fid)) {
    await SecureStore.setItemAsync(
      "sessions",
      JSON.stringify(
        sessions.map((s: Session) => (s.fid === session.fid ? session : s)),
      ),
    );
  } else {
    await SecureStore.setItemAsync(
      "sessions",
      JSON.stringify([...sessions, session]),
    );
  }
};
