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
  loginUser,
  getSigner,
  validateSigner,
  updateSigner,
  updateUser,
  validateSignerByPublicKey,
} from "../server/auth";
import {
  getSession,
  removeSession,
  updateSession,
} from "../utils/local-storage";
import { useSettings } from "../api/settings";
import { fetchUser } from "../api/farcaster";
import {
  useLoginWithFarcaster,
  usePrivy,
  User as PrivyUser,
} from "@privy-io/expo";

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
  isInitializing: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [signer, setSigner] = useState<GetSignerResponse | undefined>(
    undefined,
  );
  const [user, setUser] = useState<FarcasterUser | undefined>(undefined);
  const [isInitializing, setIsInitializing] = useState(true);
  const { getAccessToken, logout: logoutPrivy, user: privyUser } = usePrivy();
  const { data } = useSettings(session);

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        handleSessionChange(session).then(() => {
          setIsInitializing(false);
        });
      } else {
        setIsInitializing(false);
      }
    });
  }, []);

  const handleRefreshSigner = useCallback(async () => {
    if (!session) return;

    if (!signer?.token) {
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

  const { loginWithFarcaster } = useLoginWithFarcaster({
    onSuccess: async (user) => {
      await loginViaPrivyToken();
    },
    onError: (error) => {
      console.error("Error logging in", error);
    },
  });

  const handleSessionChange = useCallback(async (session: Session) => {
    setSession(session);
    getSigner().then((signer) => {
      setSigner(signer);
      updateSigner(signer);
    });
    fetchUser(session.fid).then((user) => {
      setUser(user);
      updateUser(user);
    });
    await updateSession(session);
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
    const remainingSessions = await removeSession(session);
    if (remainingSessions.length > 0) {
      await handleSessionChange(remainingSessions[0]);
    } else {
      setSession(undefined);
      setSigner(undefined);
      setUser(undefined);
    }
  }, [session, handleSessionChange]);

  const login = useCallback(async () => {
    await logout();
    await loginWithFarcaster({ relyingParty: "https://nook.social" });
  }, [logout, loginWithFarcaster]);

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
        isInitializing,
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
