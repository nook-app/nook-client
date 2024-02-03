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
import { API_BASE_URL } from "../constants";
import { Entity } from "@flink/common/types";

const sessionKey = "session";

type SignInParams = {
  message: string;
  nonce: string;
  signature: string;
};

type Session = {
  entity: Entity;
  token: string;
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
  signOut: () => Promise<void>;
};

type AuthContextValue = AuthContextMethods & Pick<State, "session">;

type AuthenticatedAuthContextValue = AuthContextMethods & {
  session: Session;
};

const AuthContext = createContext<AuthContextValue>({
  session: undefined,
  signIn: async () => undefined,
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

  const signIn = useCallback(async (body: SignInParams) => {
    const reject = (message: string) => {
      throw new Error(`Sign in failed: ${message}`);
    };

    try {
      const signInResponse = await fetch(`${API_BASE_URL}/auth/farcaster`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!signInResponse.ok) {
        reject(await signInResponse.text());
      }

      const session: Session = await signInResponse.json();
      await SecureStore.setItemAsync(sessionKey, JSON.stringify(session));
      dispatch({ type: "onSignIn", session });
    } catch (error) {
      reject((error as Error).message);
    }
  }, []);

  const signOut = useCallback(async () => {
    SecureStore.deleteItemAsync(sessionKey);
    dispatch({ type: "onSignOut" });
  }, []);

  const init = useCallback(async () => {
    const persistedSessionJson = await SecureStore.getItemAsync(sessionKey);

    if (persistedSessionJson) {
      try {
        const session: Session = JSON.parse(persistedSessionJson);
        dispatch({ type: "onSignIn", session });
      } catch (error) {
        console.error(error);
        dispatch({ type: "onSignOut" });
      }
    } else {
      dispatch({ type: "onSignOut" });
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <AuthContext.Provider
      value={{
        session: state.session,
        signIn,
        signOut,
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
        siweUri: "http://localhost:3000",
        domain: "localhost:3000",
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
