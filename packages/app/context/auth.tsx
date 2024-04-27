import { useLogin, usePrivy } from "@privy-io/react-auth";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import {
  FarcasterUser,
  GetSignerResponse,
  Session,
  User,
} from "@nook/app/types";
import {
  loginServer,
  logoutServer,
  loginUser,
  getSigner,
  validateSigner,
  getServerSession,
} from "../server/auth";
import { removeSession, updateSession } from "../utils/local-storage";
import { useSettings } from "../api/settings";
import { fetchUser } from "../api/farcaster";

type AuthContextType = {
  session?: Session;
  login: () => void;
  logout: () => void;
  setSession: (session: Session) => Promise<void>;
  refreshSigner: () => Promise<string | undefined>;
  user?: FarcasterUser;
  signer?: GetSignerResponse;
  settings?: User;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
  defaultSession,
}: {
  children: ReactNode;
  defaultSession?: Session;
}) => {
  const [session, setSession] = useState<Session | undefined>(defaultSession);
  const { getAccessToken, logout: logoutPrivy } = usePrivy();
  const { data } = useSettings(session);

  useEffect(() => {
    getServerSession().then((session) => {
      if (session) {
        handleSessionChange(session);
      }
    });
  }, []);

  useEffect(() => {
    if (
      session?.fid &&
      (!session.signer || session.signer?.state !== "completed")
    ) {
      handleRefreshSigner();
    }
  }, [session?.fid, session?.signer]);

  const handleRefreshSigner = useCallback(async () => {
    if (!session) return;

    let signer = session.signer;
    const prevState = signer?.state;

    if (!signer) {
      signer = await getSigner();
    } else {
      const validation = await validateSigner(signer.token);
      signer.state = validation.state;
    }

    if (signer.state === prevState) return signer.state;

    const updatedSession = {
      ...session,
      signer,
    };

    handleSessionChange(updatedSession);
    return signer.state;
  }, [session]);

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

    let newSession = session;

    const promises = [];
    if (newSession && !newSession.user) {
      promises.push(fetchUser(newSession.fid));
    } else {
      promises.push(null);
    }

    if (newSession && !newSession.signer) {
      promises.push(getSigner());
    } else {
      promises.push(null);
    }

    const [user, signer] = (await Promise.all(promises)) as [
      FarcasterUser | null,
      GetSignerResponse | null,
    ];

    if (newSession && !newSession.user && user) {
      newSession = {
        ...newSession,
        user,
      };
    }

    if (newSession && !newSession.signer && signer) {
      newSession = {
        ...newSession,
        signer,
      };
    }

    await loginServer(newSession);
    setSession(newSession);
    updateSession(newSession);
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
        login,
        logout,
        user: session?.user,
        signer: session?.signer,
        setSession: handleSessionChange,
        refreshSigner: handleRefreshSigner,
        settings: data,
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
