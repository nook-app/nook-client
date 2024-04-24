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
import { fetchUser, useUser } from "@nook/app/api/farcaster";
import { loginServer, logoutServer, setActiveUser } from "../server/actions";

type AuthContextType = {
  session?: Session;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  setSession: (session: Session) => Promise<void>;
  user?: FarcasterUser;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
  defaultSession,
  defaultUser,
}: {
  children: ReactNode;
  defaultSession?: Session;
  defaultUser?: FarcasterUser;
}) => {
  const [session, setSession] = useState<Session | undefined>(defaultSession);
  const [isLoading, setIsLoading] = useState(true);
  const { getAccessToken, logout: logoutPrivy } = usePrivy();
  const [user, setUser] = useState<FarcasterUser | undefined>(defaultUser);

  const updateUser = useCallback(async (fid: string) => {
    const user = await fetchUser(fid);
    setUser(user);
    setActiveUser(user);
  }, []);

  useEffect(() => {
    if (session?.fid) {
      updateUser(session.fid);
    } else {
      setUser(undefined);
      setActiveUser(undefined);
    }
  }, [session, updateUser]);

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
    onError: (error) => {},
  });

  const handleSessionChange = useCallback(async (session: Session) => {
    await loginServer(session);
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
      await loginServer(remainingSessions[0]);
      await handleSessionChange(remainingSessions[0]);
    } else {
      await logoutServer();
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
