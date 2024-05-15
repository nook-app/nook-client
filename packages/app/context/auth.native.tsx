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
  UserSettings,
} from "@nook/common/types";
import {
  loginUser,
  getSigner,
  validateSigner,
  validateSignerByPublicKey,
} from "../api/auth";
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
import * as amplitude from "@amplitude/analytics-react-native";

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
  settings?: UserSettings;
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

  const handleRefreshSigner = useCallback(async () => {
    if (!session) return;

    if (!signer?.token) {
      const signer = await getSigner();
      setSigner(signer);
      return signer.state;
    }

    const validation = await validateSigner(signer.token);
    if (validation.state === signer.state) {
      return signer.state;
    }

    signer.state = validation.state;

    return signer.state;
  }, [session, signer]);

  const handleRefreshSignerByPublicKey = useCallback(async () => {
    if (!session) return;

    if (!signer) {
      const signer = await getSigner();
      setSigner(signer);
      return signer.state;
    }

    const validation = await validateSignerByPublicKey(signer.publicKey);
    if (validation.state === signer.state) {
      return signer.state;
    }

    signer.state = validation.state;

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
    await updateSession(session);
    setSession(session);
    await Promise.all([
      getSigner().then((signer) => {
        setSigner(signer);
      }),
      fetchUser(session.fid).then((user) => {
        setUser(user);
      }),
    ]);
    amplitude.init("7819c3ae9a7a78fc6835dcc60cdeb018", `fid:${session.fid}`);
  }, []);

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
    await logoutPrivy();
    await loginWithFarcaster({
      relyingParty: "https://nook.social",
    });
  }, [logout, loginWithFarcaster]);

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        if (!session.id) {
          removeSession(session);
          setIsInitializing(false);
          return;
        }
        handleSessionChange(session).then(() => {
          setIsInitializing(false);
        });
      } else {
        setIsInitializing(false);
      }
    });
  }, [handleSessionChange]);

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
