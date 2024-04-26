import { Session } from "../types";

export const getSessions = (): Session[] => {
  return JSON.parse(localStorage.getItem("sessions") || "[]");
};

export const getSession = (): Session | undefined => {
  const rawSession = localStorage.getItem("session");
  return rawSession ? JSON.parse(rawSession) : undefined;
};

export const removeSession = (session: Session): Session[] => {
  localStorage.removeItem("session");
  const sessions = getSessions();
  const remainingSessions = sessions.filter(
    (s: Session) => s.fid !== session.fid,
  );
  localStorage.setItem("sessions", JSON.stringify(remainingSessions));
  return remainingSessions;
};

export const updateSession = (session: Session) => {
  localStorage.setItem("session", JSON.stringify(session));
  const sessions = getSessions();
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
