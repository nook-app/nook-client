import { AuthKitProvider } from "@farcaster/auth-kit";
import * as SecureStore from "expo-secure-store";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { CONFIG } from "@/constants/index";
import { Entity } from "@flink/common/types";
import { Nook } from "@flink/api/data";
import { setNooks } from "@/store/user";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { User } from "@flink/common/prisma/nook";

const sessionKey = "session";

type SignInParams = {
  message: string;
  nonce: string;
  signature: string;
};

export type Session = {
  user: User;
  entity: Entity;
  token: string;
  refreshToken: string;
  expiresAt: number;
};

type State =
  | { isInitialized: false; session: undefined }
  | {
      isInitialized: true;
      session: undefined;
    }
  | {
      isInitialized: true;
      session: Session;
    };

type Action = { type: "onSignIn"; session: Session } | { type: "onSignOut" };

type AuthContextMethods = {
  signIn: (params: SignInParams) => Promise<void>;
  signInDev: () => Promise<void>;
  signOut: () => Promise<void>;
};

type AuthContextValue = AuthContextMethods & Pick<State, "session">;

type AuthenticatedAuthContextValue = AuthContextMethods & {
  session: Session;
};

const AuthContext = createContext<AuthContextValue>({
  session: undefined,
  signIn: async () => undefined,
  signInDev: async () => undefined,
  signOut: async () => undefined,
});

const initialState: State = {
  isInitialized: false,
  session: undefined,
};

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case "onSignIn":
      return {
        isInitialized: true,
        session: action.session,
      };
    case "onSignOut":
      return {
        isInitialized: true,
        session: undefined,
      };
  }
}

type AuthProviderProps = {
  children: ReactNode;
};

function AuthProviderContent({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const appDispatch = useAppDispatch();

  const signIn = useCallback(async (body: SignInParams) => {
    const reject = (message: string) => {
      throw new Error(`Sign in failed: ${message}`);
    };

    try {
      const signInResponse = await fetch(
        `${CONFIG.apiBaseUrl}/auth/farcaster`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      if (!signInResponse.ok) {
        reject(await signInResponse.text());
      }

      const session: Session = await signInResponse.json();
      await SecureStore.setItemAsync(sessionKey, JSON.stringify(session));
      dispatch({ type: "onSignIn", session });
      await initializeUser(session);
    } catch (error) {
      reject((error as Error).message);
    }
  }, []);

  const signOut = useCallback(async () => {
    SecureStore.deleteItemAsync(sessionKey);
    dispatch({ type: "onSignOut" });
  }, []);

  const initializeUser = useCallback(
    async (session: Session) => {
      const { nooks }: { nooks: Nook[] } = await fetch(
        `${CONFIG.apiBaseUrl}/nooks`,
        {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        },
      ).then((res) => res.json());
      appDispatch(setNooks(nooks));
    },
    [appDispatch],
  );

  const refreshToken = useCallback(async (session: Session) => {
    const reject = (message: string) => {
      throw new Error(`Sign in failed: ${message}`);
    };

    const response = await fetch(`${CONFIG.apiBaseUrl}/token`, {
      headers: {
        Authorization: `Bearer ${session.refreshToken}`,
      },
    });

    if (!response.ok) {
      reject(await response.text());
    }

    await SecureStore.setItemAsync(
      sessionKey,
      JSON.stringify({ ...session, ...(await response.json()) }),
    );
  }, []);

  const init = useCallback(async () => {
    const persistedSessionJson = await SecureStore.getItemAsync(sessionKey);

    if (persistedSessionJson) {
      try {
        const session: Session = JSON.parse(persistedSessionJson);
        dispatch({ type: "onSignIn", session });
        await initializeUser(session);
        if (session.expiresAt - Math.floor(Date.now() / 1000) < 24 * 60 * 60) {
          await refreshToken(session);
        }
      } catch (error) {
        console.error(error);
        dispatch({ type: "onSignOut" });
      }
    } else {
      dispatch({ type: "onSignOut" });
    }
  }, [initializeUser, refreshToken]);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <AuthContext.Provider
      value={{
        session: state.session,
        signIn,
        signOut,
        signInDev: async () =>
          signIn({
            message:
              "localhost:3000 wants you to sign in with your Ethereum account:\n0x94Bac74eC80C25fd5F19A76F2cd74a46d6618c3A\n\nFarcaster Connect\n\nURI: http://localhost:3000\nVersion: 1\nChain ID: 10\nNonce: yRnR3Cv5FjrRQwAfl\nIssued At: 2024-02-02T23:29:10.600Z\nResources:\n- farcaster://fid/262426",
            nonce: "yRnR3Cv5FjrRQwAfl",
            signature:
              "0x7f539bb1a70bcace1bd652529068b441e38298aa57bb2aca0714a7e7f6c48600613a9c86562890cb948de4a56912a54752c496c69eadc5fb80612d4e615458f41b",
          }),
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
