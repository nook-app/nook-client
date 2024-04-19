import { LoadingScreen } from '@/components/LoadingScreen'
import { useUser } from '@/hooks/useUser'
import { TapGestureHandler } from 'react-native-gesture-handler'
import {
  ScrollView,
  Switch,
  TamaguiConfig,
  Text,
  View,
  XStack,
  YStack,
  useTheme as useTamaguiTheme,
} from 'tamagui'
import { PowerBadge } from '@/components/PowerBadge'
import { useAuth } from '@/context/auth'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { SheetType, useSheets } from '@/context/sheet'
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons'
import { UserAvatar } from '@/components/UserAvatar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Label } from '@/components/Label'
import { Image } from 'expo-image'
import { useTheme } from '@/context/theme'
import { haptics } from '@/utils/haptics'
import { HelpCircle, Monitor, Moon, Settings, Sun } from '@tamagui/lucide-icons'
import { useActions } from '@/context/actions'
import { useState } from 'react'
import { updateEnableDegenTip } from '@/utils/api'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useQueryClient } from '@tanstack/react-query'
import { User } from '@/types'
import { DebouncedLink } from '@/components/DebouncedLink'
import { IconButton } from '@/components/IconButton'
import { Button } from '@/components/Button'

export default function FarcasterProfile() {
  const { session } = useAuth()
  const { user } = useUser(session?.fid || '')
  const { openSheet } = useSheets()
  const insets = useSafeAreaInsets()
  const height = useBottomTabBarHeight()

  if (!session || !user) {
    return <LoadingScreen />
  }

  return (
    <View
      flex={1}
      backgroundColor="$color1"
      style={{
        paddingTop: insets.top,
        paddingBottom: height,
      }}
      justifyContent="space-between"
      paddingHorizontal="$2"
    >
      <ScrollView>
        <YStack gap="$3" marginBottom="$3">
          <View />
          <YStack
            gap="$3"
            backgroundColor="$shadowColorPress"
            padding="$3"
            borderRadius="$6"
          >
            <View flexDirection="row" justifyContent="space-between">
              <XStack justifyContent="space-between" flex={1}>
                <XStack gap="$3" alignItems="center">
                  <UserAvatar pfp={user.pfp} size="$6" />
                  <YStack gap="$1">
                    <XStack gap="$1.5" alignItems="center">
                      <Text fontWeight="600" fontSize="$5" color="$mauve12">
                        {user.displayName || user.username}
                      </Text>
                      <PowerBadge fid={user.fid} />
                    </XStack>
                    <Text fontSize="$4" color="$mauve12">
                      {user.username ? `@${user.username}` : `!${user.fid}`}
                    </Text>
                  </YStack>
                </XStack>
                <XStack alignItems="center" paddingHorizontal="$2" gap="$2">
                  <IconButton href={{ pathname: '/settings' }}>
                    <Settings size={16} color="white" />
                  </IconButton>
                  <IconButton onPress={() => openSheet(SheetType.SwitchAccount)}>
                    <MaterialCommunityIcons
                      name="account-convert"
                      size={16}
                      color="white"
                    />
                  </IconButton>
                </XStack>
              </XStack>
            </View>
            <DebouncedLink
              href={{
                pathname: `/users/[fid]`,
                params: { fid: user.fid },
              }}
            >
              <Button>View Profile</Button>
            </DebouncedLink>
          </YStack>
          <ThemeSelector />
          <CustomActions />
          <DegenTipping />
        </YStack>
      </ScrollView>
    </View>
  )
}

const DegenTipping = () => {
  const theme = useTamaguiTheme()
  const { session, metadata } = useAuth()
  const queryClient = useQueryClient()
  const [enabled, setEnabled] = useState(metadata?.enableDegenTip || false)

  const toggleAction = async (enabled: boolean) => {
    haptics.selection()
    setEnabled(enabled)
    await updateEnableDegenTip(enabled)
    queryClient.setQueryData<User>(['authUser', session?.fid], (prev) => {
      if (!prev) return
      return { ...prev, metadata: { ...prev.metadata, enableDegenTip: enabled } }
    })
  }

  return (
    <YStack gap="$3" backgroundColor="$shadowColorPress" padding="$3" borderRadius="$6">
      <Label>Miscellaneous</Label>
      <XStack gap="$4" justifyContent="space-between">
        <YStack flex={1}>
          <XStack gap="$2" alignItems="center">
            <Image
              source={require('@/assets/degen.svg')}
              style={{ width: 14, height: 12 }}
              tintColor={theme.color12.val}
            />
            <Text color="$mauve12" fontWeight="600">
              Enable Degen Tipping
            </Text>
          </XStack>
          <Text color="$mauve11">
            Allows you to quickly tip any cast with your $DEGEN allowance.
          </Text>
        </YStack>
        <Switch defaultChecked={enabled} onCheckedChange={toggleAction}>
          <Switch.Thumb backgroundColor="white" />
        </Switch>
      </XStack>
    </YStack>
  )
}

const CustomActions = () => {
  const { actions } = useActions()
  const theme = useTamaguiTheme()
  const { openSheet } = useSheets()

  const RADIUS = 75
  const MAX_ACTIONS = 8

  const calculatePosition = (index: number) => {
    const angle = ((2 * Math.PI) / MAX_ACTIONS) * index
    const x = RADIUS * Math.cos(angle)
    const y = RADIUS * Math.sin(angle)
    return { x, y }
  }

  return (
    <YStack gap="$3" backgroundColor="$shadowColorPress" padding="$3" borderRadius="$6">
      <TouchableOpacity
        onPress={() =>
          openSheet(SheetType.Info, {
            title: 'New: Cast Actions',
            description:
              'Nook allows you to easily perform many actions on casts using the Action Wheel. Hold the action button to open the wheel. Drag and release to select an action to perform.\n\nNook will also remember your last performed action and use it as the default for taps.',
          })
        }
      >
        <XStack gap="$1" alignItems="center">
          <Label>Action wheel</Label>
          <HelpCircle size={12} color="$mauve11" />
        </XStack>
      </TouchableOpacity>
      <Text alignSelf="center" textAlign="center">
        Tap on a position in the wheel to customize the action.
      </Text>
      <View justifyContent="center" alignItems="center">
        <View
          backgroundColor="$color3"
          style={{
            borderRadius: 150,
            overflow: 'hidden',
            width: 200,
            height: 200,
            borderColor: theme.color5.val,
            borderWidth: 1,
          }}
        >
          {actions.map((action, index) => {
            const position = calculatePosition(index)
            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  haptics.selection()
                  openSheet(SheetType.BrowseActions, {
                    index,
                  })
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View
                  key={index}
                  position="absolute"
                  left={position.x + 100 - 32}
                  top={position.y + 100 - 32}
                  width="$6"
                  height="$6"
                  borderRadius="$10"
                  alignItems="center"
                  justifyContent="center"
                >
                  {action?.icon ? (
                    <Octicons
                      // @ts-ignore
                      name={action.icon}
                      size={20}
                      color={theme.color12.val}
                      opacity={0.75}
                    />
                  ) : (
                    <Octicons
                      // @ts-ignore
                      name="dot-fill"
                      size={16}
                      color={theme.color12.val}
                      opacity={0.25}
                    />
                  )}
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
      <TouchableOpacity
        onPress={() =>
          openSheet(SheetType.BrowseActions, {
            index: null,
          })
        }
      >
        <View padding="$3">
          <Text color="$mauve11" textAlign="center">
            Tap to browse actions to install on Warpcast.
          </Text>
        </View>
      </TouchableOpacity>
    </YStack>
  )
}

const ThemeSelector = () => {
  const { theme: myTheme, setTheme, colorSchemeOverride, toggleColorScheme } = useTheme()

  const themes = ['mauve', 'blue', 'green', 'orange', 'pink', 'purple', 'red', 'yellow']

  const defaultTheme =
    colorSchemeOverride === 'light' ? 'light' : ('dark' as keyof TamaguiConfig['themes'])

  return (
    <YStack gap="$3" backgroundColor="$shadowColorPress" padding="$3" borderRadius="$6">
      <XStack justifyContent="space-between" alignItems="center">
        <Label>Select Theme</Label>
        <TouchableOpacity
          onPress={toggleColorScheme}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
        >
          {colorSchemeOverride === 'light' && (
            <XStack gap="$1.5" alignItems="center">
              <Sun size={16} color="$mauve12" />
              <Label>Light Mode</Label>
            </XStack>
          )}
          {colorSchemeOverride === 'dark' && (
            <XStack gap="$1.5" alignItems="center">
              <Moon size={16} color="$mauve12" />
              <Label>Dark Mode</Label>
            </XStack>
          )}
          {colorSchemeOverride === null && (
            <XStack gap="$1.5" alignItems="center">
              <Monitor size={16} color="$mauve12" />
              <Label>System</Label>
            </XStack>
          )}
        </TouchableOpacity>
      </XStack>
      <XStack justifyContent="space-around">
        <TapGestureHandler>
          <View
            theme={defaultTheme}
            backgroundColor="$color1"
            width="$2.5"
            height="$2.5"
            borderRadius="$10"
            borderWidth="$1"
            borderColor={myTheme === defaultTheme ? '$color11' : '$color7'}
            onPress={() => setTheme(defaultTheme)}
          />
        </TapGestureHandler>
        {themes.map((t, i) => (
          <TapGestureHandler key={i}>
            <View
              theme={t as keyof TamaguiConfig['themes']}
              backgroundColor={'$color5'}
              width="$2.5"
              height="$2.5"
              borderRadius="$10"
              borderWidth="$1"
              borderColor={myTheme === t ? '$color11' : '$color7'}
              onPress={() => setTheme(t)}
            />
          </TapGestureHandler>
        ))}
      </XStack>
    </YStack>
  )
}
