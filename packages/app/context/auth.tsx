import { useLogin, usePrivy } from "@privy-io/react-auth";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { loginUser } from "@nook/app/api/auth";
import { FarcasterUser, Session } from "@nook/app/types";
import { useUser } from "@nook/app/api/farcaster";

type AuthContextType = {
  session?: Session;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  setSession: (session: Session) => void;
  user?: FarcasterUser;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session>();
  const [isLoading, setIsLoading] = useState(true);
  const { getAccessToken, logout: logoutPrivy } = usePrivy();
  const { data: user } = useUser(session?.fid || "");

  useEffect(() => {
    const init = async () => {
      const rawSession = localStorage.getItem("session");
      if (!rawSession) {
        setIsLoading(false);
        return;
      }
      const session = JSON.parse(rawSession);
      await handleSessionChange(session);
      setIsLoading(false);
    };
    init();
  }, []);

  const { login } = useLogin({
    onComplete: async (user, isNewUser, wasAlreadyAuthenticated) => {
      if (wasAlreadyAuthenticated) {
        await logoutPrivy();
        return;
      }

      const token = await getAccessToken();
      if (!token) {
        return;
      }
      const session = await loginUser(token);
      await logoutPrivy();
      await handleSessionChange(session);
    },
    onError: (error) => {
      console.error("error", error);
    },
  });

  const handleSessionChange = useCallback(async (session: Session) => {
    setSession(session);
    localStorage.setItem("session", JSON.stringify(session));
    const sessions = JSON.parse(localStorage.getItem("sessions") || "[]");
    if (!sessions.some((s: Session) => s.fid === session.fid)) {
      localStorage.setItem("sessions", JSON.stringify([...sessions, session]));
    } else {
      localStorage.setItem(
        "sessions",
        JSON.stringify(
          sessions.map((s: Session) => (s.fid === session.fid ? session : s)),
        ),
      );
    }
  }, []);

  const logout = useCallback(async () => {
    if (!session) return;
    localStorage.removeItem("session");
    const sessions = JSON.parse(localStorage.getItem("sessions") || "[]");
    const remainingSessions = sessions.filter(
      (s: Session) => s.fid !== session.fid,
    );
    localStorage.setItem("sessions", JSON.stringify(remainingSessions));
    if (remainingSessions.length > 0) {
      await handleSessionChange(remainingSessions[0]);
    } else {
      setSession(undefined);
    }
  }, [session, handleSessionChange]);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        login,
        logout,
        user,
        setSession: handleSessionChange,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
