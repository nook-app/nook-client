import { AuthKitProvider } from '@farcaster/auth-kit'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { CONFIG } from '@/constants/index'
import {
  updateSession,
  getSession,
  deleteSession,
  Session,
  removeSession,
} from '@/utils/session'
import {
  Feed,
  GetSignerResponse,
  Nook,
  SignInDevParams,
  User,
  UserMetadata,
} from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getSigner,
  getUser,
  loginUser,
  loginUserDev,
  loginUserPrivy,
  refreshUser,
  validateSigner,
} from '@/utils/api'
import { useSheets } from './sheet'
import * as amplitude from '@amplitude/analytics-react-native'
import { router } from 'expo-router'
import { useLoginWithFarcaster, usePrivy } from '@privy-io/expo'

type AuthContextValue = {
  session?: Session
  error?: string
  isLoading: boolean
  signInDev: (params: SignInDevParams) => Promise<void>
  signInPrivy: () => Promise<void>
  signInPrivyState: string
  signOut: () => Promise<void>
  signer?: GetSignerResponse
  refreshSigner: (token: string) => Promise<string | undefined>
  setSession: (session: Session) => void
  metadata?: UserMetadata
  nooks: Nook[]
  feeds: Feed[]
  user?: User
}

type AuthenticatedAuthContextValue = AuthContextValue & {
  session: Session
}

const AuthContext = createContext<AuthContextValue>({
  session: undefined,
  isLoading: true,
  signInDev: async () => undefined,
  signInPrivy: async () => undefined,
  signInPrivyState: 'initial',
  signOut: async () => undefined,
  refreshSigner: async () => undefined,
  signer: undefined,
  setSession: () => undefined,
  metadata: undefined,
  user: undefined,
  nooks: [],
  feeds: [],
})

type AuthProviderProps = {
  children: ReactNode
}

function AuthProviderContent({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [isInitializing, setIsInitializing] = useState(true)
  const { mutate, isPending: isLoading } = useMutation({ mutationFn: loginUser })
  const { mutate: mutateDev, isPending: isLoadingDev } = useMutation({
    mutationFn: loginUserDev,
  })
  const { mutate: mutateRefresh } = useMutation({ mutationFn: refreshUser })
  const [signer, setSigner] = useState<GetSignerResponse | undefined>()
  const queryClient = useQueryClient()
  const { getAccessToken, logout } = usePrivy()
  const [signInPrivyState, setSignInPrivyState] = useState<string>('initial')

  const { loginWithFarcaster, state } = useLoginWithFarcaster({
    onSuccess: async (user) => {
      const token = await getAccessToken()
      if (!token) {
        return
      }
      const data = await loginUserPrivy(token)
      await logout()
      signIn(data)
    },
    onError: (error) => {
      console.error('error', error)
    },
  })

  useEffect(() => {
    setSignInPrivyState(state?.status || 'initial')
  }, [state])

  const { data } = useQuery<User>({
    queryKey: ['authUser', session?.fid],
    queryFn: async () => {
      const data = await getUser()
      for (const feed of data.feeds) {
        queryClient.setQueryData(['feed', feed.id], feed)
      }
      for (const nook of data.nooks) {
        queryClient.setQueryData(['nook', nook.id], nook)
      }
      return data
    },
    enabled: !!session?.fid,
  })

  useEffect(() => {
    if (session) {
      setSigner(undefined)
      getSigner().then(setSigner)
    }
  }, [session])

  const refreshSigner = async (token: string) => {
    if (!session || !signer) return
    const validation = await validateSigner(token)
    setSigner({
      ...signer,
      state: validation.state,
    })
    return validation.state
  }

  const signIn = useCallback(
    async (session: Session) => {
      setIsInitializing(true)
      await handleSetSession(session)
      setError(undefined)
      setIsInitializing(false)
      setSignInPrivyState('initial')
    },
    [mutate]
  )

  const signInDev = useCallback(
    async (params: SignInDevParams) => {
      setIsInitializing(true)
      mutateDev(params, {
        onSuccess: async (session) => {
          await handleSetSession(session)
          setError(undefined)
          setIsInitializing(false)
        },
        onError: (error) => {
          const jsonError = JSON.parse((error as Error).message) as { message: string }
          setError(jsonError?.message)
          setIsInitializing(false)
        },
      })
    },
    [mutateDev]
  )

  const signOut = useCallback(async () => {
    if (!session) return
    await deleteSession()
    const sessions = await removeSession(session)
    if (sessions.length > 0) {
      await handleSetSession(sessions[0])
    } else {
      setSession(undefined)
      await logout()
      router.replace('/')
    }
  }, [session])

  const init = useCallback(async () => {
    try {
      const session = await getSession()
      if (session) {
        mutateRefresh(session, {
          onSuccess: async (session) => {
            handleSetSession(session)
            setIsInitializing(false)
          },
          onError: () => {
            setIsInitializing(false)
          },
        })
      } else {
        setIsInitializing(false)
      }
      if (!session?.fid) {
        await deleteSession()
      }
    } catch (error) {
      await deleteSession()
    }
  }, [])

  useEffect(() => {
    init()
  }, [init])

  const handleSetSession = useCallback(
    async (session: Session) => {
      setSession(session)
      await updateSession(session)
      amplitude.init('7819c3ae9a7a78fc6835dcc60cdeb018', `fid:${session.fid}`)
      amplitude.track('login', { userId: `fid:${session.fid}` })
    },
    [setSession]
  )

  return (
    <AuthContext.Provider
      value={{
        session,
        error: error,
        isLoading: isInitializing || isLoading || isLoadingDev,
        signInPrivy: async () => {
          await loginWithFarcaster({ relyingParty: 'https://nook.social' })
        },
        signInPrivyState,
        signOut,
        signInDev,
        signer,
        refreshSigner,
        setSession: handleSetSession,
        metadata: data?.metadata,
        user: data,
        nooks: data?.nooks || [],
        feeds: data?.feeds || [],
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider(props: AuthProviderProps) {
  return (
    <AuthKitProvider
      config={{
        rpcUrl: 'https://opt-mainnet.g.alchemy.com/v2/jrjomnn0ub8MFFQOXz3X9s9oVk_Oj5Q2',
        siweUri: CONFIG.siwfUri,
        domain: CONFIG.siwfDomain,
      }}
    >
      <AuthProviderContent {...props} />
    </AuthKitProvider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function useAuthed() {
  return useContext(AuthContext) as AuthenticatedAuthContextValue
}
