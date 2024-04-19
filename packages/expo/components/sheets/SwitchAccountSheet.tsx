import { SheetType, useSheet } from '@/context/sheet'
import { Spinner, Text, View, XStack, YStack } from 'tamagui'
import { BaseSheet } from './BaseSheet'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@/context/auth'
import { Session, getSessions, refreshToken } from '@/utils/session'
import { hasUserDiff } from '@/utils'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { Check } from '@tamagui/lucide-icons'
import { useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { AuthKitProvider } from '@farcaster/auth-kit'
import { CONFIG } from '@/constants'
import { fetchUsers } from '@/utils/api'
import { FarcasterUser } from '@/types'
import { UserAvatar } from '../UserAvatar'
import { Button } from '../Button'
import { SignInWithPrivy } from '../SignInWithPrivy'

const queryClient = new QueryClient()

export const SwitchAccountSheet = () => {
  const { sheet, closeSheet, closeAllSheets } = useSheet(SheetType.SwitchAccount)
  const [sessions, setSessions] = useState<Session[]>([])
  const { session, setSession, signInPrivy, signOut, signInPrivyState } = useAuth()
  const insets = useSafeAreaInsets()

  const fids = sessions.map((s) => s.fid)
  const { data: users, isLoading } = useQuery({
    queryKey: ['farcasterProfiles', fids],
    queryFn: async () => {
      const data = await fetchUsers(fids)
      if (data?.data) {
        for (const user of data.data) {
          const existingUser = queryClient.getQueryData<FarcasterUser>(['user', user.fid])
          if (!existingUser || hasUserDiff(existingUser, user)) {
            queryClient.setQueryData(['user', user.fid], user)
          }
        }
      }
      return data
    },
    enabled: !!fids.length,
  })

  useEffect(() => {
    const fetch = async () => {
      setSessions(await getSessions())
    }
    fetch()
  }, [sheet.isOpen])

  return (
    <BaseSheet sheet={sheet}>
      <BottomSheetView
        style={{
          paddingTop: sheet.fullscreen ? insets.top : 0,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
      >
        <QueryClientProvider client={queryClient}>
          <YStack padding="$4" paddingHorizontal="$4" gap="$4">
            {!users || isLoading ? <Spinner /> : null}
            {users?.data.map((u) => (
              <TouchableOpacity
                key={u.fid}
                onPress={async () => {
                  const s = sessions.find((s) => s.fid === u.fid)
                  if (s) {
                    const token = await refreshToken(s)
                    setSession({
                      ...s,
                      ...token,
                    })
                  }
                  closeSheet(SheetType.SwitchAccount)
                }}
              >
                <Account user={u} isActive={u.fid === session?.fid} />
              </TouchableOpacity>
            ))}
            <View marginTop="$4">
              <AuthKitProvider
                config={{
                  rpcUrl:
                    'https://opt-mainnet.g.alchemy.com/v2/jrjomnn0ub8MFFQOXz3X9s9oVk_Oj5Q2',
                  siweUri: CONFIG.siwfUri,
                  domain: CONFIG.siwfDomain,
                }}
              >
                <SignInWithPrivy
                  label="Add Account"
                  onSignIn={async () => {
                    await signInPrivy()
                    closeAllSheets()
                  }}
                  signInState={signInPrivyState}
                />
              </AuthKitProvider>
            </View>
            <Button
              variant="outlined"
              onPress={() => {
                signOut()
                closeAllSheets()
              }}
            >
              Sign Out
            </Button>
          </YStack>
        </QueryClientProvider>
      </BottomSheetView>
    </BaseSheet>
  )
}

const Account = ({ user, isActive }: { user: FarcasterUser; isActive: boolean }) => {
  return (
    <XStack justifyContent="space-between" alignItems="center">
      <XStack gap="$2" alignItems="center">
        <UserAvatar pfp={user.pfp} size="$4" />
        <YStack gap="$1">
          {user.displayName && (
            <Text fontWeight="700" color="$mauve12">
              {user.displayName}
            </Text>
          )}
          <Text fontWeight="500" color="$mauve12">
            {user.username || `!${user.fid}`}
          </Text>
        </YStack>
      </XStack>
      {isActive && (
        <View backgroundColor="$color8" borderRadius="$12" padding="$1.5">
          <Check size={12} strokeWidth={4} color="white" />
        </View>
      )}
    </XStack>
  )
}
