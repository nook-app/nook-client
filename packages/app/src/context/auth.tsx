import { AuthKitProvider } from "@farcaster/auth-kit";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CONFIG, DEV_SIGN_IN } from "@/constants/index";
import { setEntity, setUserData } from "@/store/user";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import {
  fetchSession,
  getSession,
  removeSession,
  Session,
} from "@/utils/session";
import { getUserData, SignInParams } from "@/utils/api";

type AuthContextValue = {
  session?: Session;
  error?: Error;
  isInitializing: boolean;
  signIn: (params: SignInParams) => Promise<void>;
  signInDev: () => Promise<void>;
  signOut: () => Promise<void>;
};

type AuthenticatedAuthContextValue = AuthContextValue & {
  session: Session;
};

const AuthContext = createContext<AuthContextValue>({
  session: undefined,
  isInitializing: true,
  signIn: async () => undefined,
  signInDev: async () => undefined,
  signOut: async () => undefined,
});

type AuthProviderProps = {
  children: ReactNode;
};

function AuthProviderContent({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isInitializing, setIsInitializing] = useState(true);
  const dispatch = useAppDispatch();

  const signIn = useCallback(
    async (body: SignInParams) => {
      try {
        const session = await fetchSession(body);
        dispatch(setUserData(await getUserData(session)));
        dispatch(setEntity(session.entity));
        setSession(session);
      } catch (error) {
        setError(new Error(`Sign in failed: ${(error as Error).message}`));
      }
    },
    [dispatch],
  );

  const signOut = useCallback(async () => {
    await removeSession();
    setSession(undefined);
  }, []);

  const init = useCallback(async () => {
    try {
      const session = await getSession();
      if (session) {
        setSession(session);
        dispatch(setUserData(await getUserData(session)));
        dispatch(setEntity(session.entity));
      }
    } catch (error) {
      await removeSession();
    }
    setIsInitializing(false);
  }, [dispatch]);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <AuthContext.Provider
      value={{
        session,
        error,
        isInitializing,
        signIn,
        signOut,
        signInDev: async () => signIn(DEV_SIGN_IN),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider(props: AuthProviderProps) {
  return (
    <AuthKitProvider
      config={{
        relay: "https://relay.farcaster.xyz",
        rpcUrl: "https://mainnet.optimism.io",
        siweUri: CONFIG.siwfUri,
        domain: CONFIG.siwfDomain,
      }}
    >
      <AuthProviderContent {...props} />
    </AuthKitProvider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useAuthed() {
  return useContext(AuthContext) as AuthenticatedAuthContextValue;
}
