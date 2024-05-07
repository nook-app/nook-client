import { useLogin, usePrivy, User as PrivyUser } from "@privy-io/react-auth";
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
} from "@nook/common/types";
import {
  loginServer,
  logoutServer,
  loginUser,
  getSigner,
  validateSigner,
  updateSigner,
  updateUser,
  validateSignerByPublicKey,
} from "../server/auth";
import { removeSession, updateSession } from "../utils/local-storage";
import { useSettings } from "../api/settings";
import { fetchUser } from "../api/farcaster";

type AuthContextType = {
  session?: Session;
  login: () => void;
  loginViaPrivyToken: () => Promise<void>;
  logout: () => void;
  setSession: (session: Session) => Promise<void>;
  refreshSigner: () => Promise<string | undefined>;
  refreshSignerByPublicKey: () => Promise<string | undefined>;
  user?: FarcasterUser;
  setUser: (user: FarcasterUser) => void;
  signer?: GetSignerResponse;
  setSigner: (signer: GetSignerResponse) => void;
  settings?: User;
  privyUser?: PrivyUser;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
  defaultSession,
  defaultUser,
  defaultSigner,
}: {
  children: ReactNode;
  defaultSession?: Session;
  defaultUser?: FarcasterUser;
  defaultSigner?: GetSignerResponse;
}) => {
  const [session, setSession] = useState<Session | undefined>(defaultSession);
  const [signer, setSigner] = useState<GetSignerResponse | undefined>(
    defaultSigner,
  );
  const [user, setUser] = useState<FarcasterUser | undefined>(defaultUser);
  const { getAccessToken, logout: logoutPrivy, user: privyUser } = usePrivy();
  const { data } = useSettings(session);

  const handleRefreshSigner = useCallback(async () => {
    if (!session) return;

    if (!signer) {
      const signer = await getSigner();
      await updateSigner(signer);
      setSigner(signer);
      return signer.state;
    }

    const validation = await validateSigner(signer.token);
    if (validation.state === signer.state) {
      return signer.state;
    }

    signer.state = validation.state;
    await updateSigner(signer);

    return signer.state;
  }, [session, signer]);

  const handleRefreshSignerByPublicKey = useCallback(async () => {
    if (!session) return;

    if (!signer) {
      const signer = await getSigner();
      await updateSigner(signer);
      setSigner(signer);
      return signer.state;
    }

    const validation = await validateSignerByPublicKey(signer.publicKey);
    if (validation.state === signer.state) {
      return signer.state;
    }

    signer.state = validation.state;
    await updateSigner(signer);

    return signer.state;
  }, [session, signer]);

  const { login } = useLogin({
    onComplete: async (user, isNewUser, wasAlreadyAuthenticated) => {
      if (wasAlreadyAuthenticated) {
        await logoutPrivy();
        return;
      }
      await loginViaPrivyToken();
    },
    onError: (error) => {
      console.error("Error logging in", error);
    },
  });

  const handleSessionChange = useCallback(async (session: Session) => {
    await loginServer(session);
    setSession(session);
    getSigner().then((signer) => {
      setSigner(signer);
      updateSigner(signer);
    });
    fetchUser(session.fid).then((user) => {
      setUser(user);
      updateUser(user);
    });
    updateSession(session);
  }, []);

  useEffect(() => {
    if (session?.fid) {
    }
  }, [session?.fid]);

  const loginViaPrivyToken = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      return;
    }
    const session = await loginUser(token);
    await logoutPrivy();
    await handleSessionChange(session);
  }, [getAccessToken, logoutPrivy, handleSessionChange]);

  const logout = useCallback(async () => {
    if (!session) return;
    const remainingSessions = removeSession(session);
    if (remainingSessions.length > 0) {
      await loginServer(remainingSessions[0]);
      await handleSessionChange(remainingSessions[0]);
    } else {
      await logoutServer();
      setSession(undefined);
      setSigner(undefined);
      setUser(undefined);
    }
  }, [session, handleSessionChange]);

  return (
    <AuthContext.Provider
      value={{
        privyUser: privyUser || undefined,
        session,
        login,
        loginViaPrivyToken,
        logout,
        user,
        setUser,
        signer,
        setSigner,
        setSession: handleSessionChange,
        refreshSigner: handleRefreshSigner,
        refreshSignerByPublicKey: handleRefreshSignerByPublicKey,
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
