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
  UserSettings,
} from "@nook/common/types";
import {
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
import { updateServerSession, deleteServerSession } from "../server/session";
import { loginUser } from "../api/auth";

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
    await updateServerSession(session);
    setSession(session);
    updateSession(session);
    await Promise.all([
      getSigner().then((signer) => {
        setSigner(signer);
        updateSigner(signer);
      }),
      fetchUser(session.fid).then((user) => {
        setUser(user);
        updateUser(user);
      }),
    ]);
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
      await updateServerSession(remainingSessions[0]);
      await handleSessionChange(remainingSessions[0]);
    } else {
      await deleteServerSession();
      setSession(undefined);
      setSigner(undefined);
      setUser(undefined);
    }
  }, [session, handleSessionChange]);

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        if (!session.id) {
          removeSession(session);
          return;
        }
        handleSessionChange(session);
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
        isInitializing: false,
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
