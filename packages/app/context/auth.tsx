import { useLogin, usePrivy } from "@privy-io/react-auth";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { FarcasterUser, Session, User } from "@nook/app/types";
import { fetchUser } from "@nook/app/api/farcaster";
import {
  loginServer,
  logoutServer,
  setActiveUser,
  loginUser,
} from "../server/auth";
import { ThemeProvider } from "./theme";
import { ThemeName } from "@nook/ui";
import {
  getSession,
  removeSession,
  updateSession,
} from "../utils/local-storage";
import { useSettings } from "../api/settings";

type AuthContextType = {
  session?: Session;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  setSession: (session: Session) => Promise<void>;
  user?: FarcasterUser;
  settings?: User;
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

  const { data } = useSettings();

  const updateUser = useCallback(async (fid: string) => {
    const user = await fetchUser(fid);
    setUser(user);
    setActiveUser(user);
  }, []);

  useEffect(() => {
    if (session?.fid) {
      if (user?.fid !== session.fid) {
        updateUser(session.fid);
      }
    } else {
      setUser(undefined);
      setActiveUser(undefined);
    }
  }, [session, user, updateUser]);

  useEffect(() => {
    const init = async () => {
      const session = getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }
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
    updateSession(session);
  }, []);

  const logout = useCallback(async () => {
    if (!session) return;
    const remainingSessions = removeSession(session);
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
        settings: data,
      }}
    >
      <ThemeProvider defaultTheme={session?.theme as ThemeName | undefined}>
        {children}
      </ThemeProvider>
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
