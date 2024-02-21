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
import {
  updateSession,
  getSession,
  removeSession,
  Session,
} from "@/utils/session";
import { SignInParams, userApi } from "@/store/apis/userApi";

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
  const [getUser] = userApi.useLazyGetUserQuery();
  const [loginUser] = userApi.useLoginUserMutation();

  const signIn = useCallback(
    async (body: SignInParams) => {
      const response = await loginUser(body);
      if ("error" in response) {
        setError(new Error(`Sign in failed: ${response.error}`));
        return;
      }

      try {
        const session = response.data;
        await updateSession(session);
        setSession(session);
        await getUser(null);
      } catch (error) {
        setError(new Error(`Sign in failed: ${(error as Error).message}`));
      }
    },
    [getUser, loginUser],
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
        await getUser(null);
      }
    } catch (error) {
      await removeSession();
    }
    setIsInitializing(false);
  }, [getUser]);

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
        rpcUrl:
          "https://opt-mainnet.g.alchemy.com/v2/jrjomnn0ub8MFFQOXz3X9s9oVk_Oj5Q2",
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
