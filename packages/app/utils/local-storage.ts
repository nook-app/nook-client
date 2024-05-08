import { Session } from "@nook/common/types";

export const getSessions = async (): Promise<Session[]> => {
  return JSON.parse(localStorage.getItem("sessions") || "[]");
};

export const getSession = async (): Promise<Session | undefined> => {
  const rawSession = localStorage.getItem("session");
  return rawSession ? JSON.parse(rawSession) : undefined;
};

export const removeSession = async (session: Session): Promise<Session[]> => {
  localStorage.removeItem("session");
  const sessions = await getSessions();
  const remainingSessions = sessions.filter(
    (s: Session) => s.fid !== session.fid,
  );
  localStorage.setItem("sessions", JSON.stringify(remainingSessions));
  return remainingSessions;
};

export const updateSession = async (session: Session) => {
  localStorage.setItem("session", JSON.stringify(session));
  const sessions = await getSessions();
  if (sessions.some((s: Session) => s.fid === session.fid)) {
    localStorage.setItem(
      "sessions",
      JSON.stringify(
        sessions.map((s: Session) => (s.fid === session.fid ? session : s)),
      ),
    );
  } else {
    localStorage.setItem("sessions", JSON.stringify([...sessions, session]));
  }
};
