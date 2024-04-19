import { useLocalSearchParams } from 'expo-router'
import { LoadingScreen } from '@/components/LoadingScreen'
import { FarcasterFeedPanel } from '@/components/farcaster/FarcasterFeedPanel'
import { Panels } from '@/components/panels/Panels'
import { useUser } from '@/hooks/useUser'
import { formatAddress, formatNumber, formatToWarpcastCDN } from '@/utils'
import { Stack, router } from 'expo-router'
import { Text, View, XStack, YStack } from 'tamagui'
import { PanelDisplay, FarcasterUser, UserFilterType } from '@/types'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Search,
} from '@tamagui/lucide-icons'
import { useToastController } from '@tamagui/toast'
import { haptics } from '@/utils/haptics'
import { CHAIN_DATA, Chain } from '@/utils/chains'
import * as Clipboard from 'expo-clipboard'
import { Image } from 'expo-image'
import { Tabs, useCurrentTabScrollY } from 'react-native-collapsible-tab-view'
import { Linking } from 'react-native'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useCastFeed } from '@/hooks/useCastFeed'
import { SheetType, useSheets } from '@/context/sheet'
import { DebouncedLink } from '@/components/DebouncedLink'
import { UserAvatar } from '@/components/UserAvatar'
import { PowerBadge } from '@/components/PowerBadge'
import { FarcasterUserFollowButton } from '@/components/farcaster/FarcasterUserFollowButton'
import { FarcasterBioText } from '@/components/farcaster/FarcasterBioText'
import { IconButton } from '@/components/IconButton'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { useImageColors } from '@/hooks/useImageColors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { useTheme } from '@/context/theme'
import { LinearGradient } from '@tamagui/linear-gradient'

const UserHeader = ({ user }: { user: FarcasterUser }) => {
  const { openSheet } = useSheets()
  const scrollY = useCurrentTabScrollY()
  const colors = useImageColors(
    user.pfp ? formatToWarpcastCDN(user.pfp, { width: 96 }) : undefined
  )
  const insets = useSafeAreaInsets()
  const { colorScheme } = useTheme()

  const bio = user?.bio?.trim().replace(/\n\s*\n/g, '\n')

  const headerTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 50, 100],
      [0, 0, 1],
      Extrapolation.CLAMP
    )

    return {
      opacity,
    }
  })

  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <View
              height="$9"
              paddingTop={insets.top}
              paddingHorizontal="$3"
              backgroundColor="$color1"
              justifyContent="center"
            >
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    flex: 1,
                  },
                  headerTitleStyle,
                ]}
              >
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  colors={[
                    colors.backgroundColor,
                    colors.primaryColor,
                    colors.secondaryColor,
                    colors.backgroundColor,
                    colors.primaryColor,
                  ]}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    flex: 1,
                    opacity: 0.5,
                  }}
                />
                <BlurView
                  intensity={100}
                  tint={colorScheme}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    flex: 1,
                  }}
                />
              </Animated.View>
              <XStack alignItems="center" justifyContent="space-between">
                <XStack width="$7">
                  <IconButton onPress={() => router.back()}>
                    <ArrowLeft size={16} color="white" />
                  </IconButton>
                </XStack>
                <Animated.View style={[headerTitleStyle]}>
                  <XStack gap="$1.5" alignItems="center">
                    <View borderRadius="$10" overflow="hidden">
                      <UserAvatar pfp={user.pfp} size="$1" />
                    </View>
                    <View flexShrink={1}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        fontWeight="600"
                        fontSize="$5"
                        color="$mauve12"
                      >
                        {user.displayName || user.username || `!${user.fid}`}
                      </Text>
                    </View>
                    <PowerBadge fid={user.fid} />
                  </XStack>
                </Animated.View>
                <XStack gap="$2" width="$7" justifyContent="flex-end">
                  <IconButton
                    href={{
                      pathname: '/search/[query]',
                      params: { fid: user.fid },
                    }}
                  >
                    <Search size={16} color="white" />
                  </IconButton>
                  <IconButton
                    onPress={() => openSheet(SheetType.UserAction, { fid: user.fid })}
                  >
                    <MoreHorizontal size={16} color="white" />
                  </IconButton>
                </XStack>
              </XStack>
            </View>
          ),
        }}
      />
      <YStack gap="$3" backgroundColor="$color1" padding="$3">
        <View flexDirection="row" justifyContent="space-between">
          <YStack gap="$2">
            <DebouncedLink
              href={{
                pathname: '/image/[url]',
                params: { url: user.pfp },
              }}
              absolute
              asChild
            >
              <View>
                <UserAvatar pfp={user.pfp} size="$6" />
              </View>
            </DebouncedLink>
            <YStack gap="$1">
              <XStack gap="$1.5" alignItems="center">
                <Text fontWeight="600" fontSize="$6" color="$mauve12">
                  {user.displayName || user.username}
                </Text>
                <PowerBadge fid={user.fid} />
              </XStack>
              <XStack gap="$2" alignItems="center">
                <Text fontSize="$4" color="$mauve11">
                  {user.username ? `@${user.username}` : `!${user.fid}`}
                </Text>
                <Text fontSize="$4" color="$mauve11">
                  {`#${user.fid}`}
                </Text>
                {user.context?.followers && (
                  <View
                    paddingVertical="$1"
                    paddingHorizontal="$2"
                    borderRadius="$2"
                    backgroundColor="$color3"
                  >
                    <Text fontSize="$2" fontWeight="500" color="$color11">
                      Follows you
                    </Text>
                  </View>
                )}
              </XStack>
            </YStack>
          </YStack>
          <View>
            <FarcasterUserFollowButton fid={user.fid} />
          </View>
        </View>
        {bio && <FarcasterBioText text={bio} selectable />}
        <XStack gap="$2">
          <DebouncedLink
            href={{
              pathname: `/users/[fid]/following`,
              params: { fid: user.fid },
            }}
          >
            <View flexDirection="row" alignItems="center" gap="$1">
              <Text fontWeight="600" color="$mauve12">
                {formatNumber(user.engagement?.following || 0)}
              </Text>
              <Text color="$mauve11">following</Text>
            </View>
          </DebouncedLink>
          <DebouncedLink
            href={{
              pathname: `/users/[fid]/followers`,
              params: { fid: user.fid },
            }}
          >
            <View flexDirection="row" alignItems="center" gap="$1">
              <Text fontWeight="600" color="$mauve12">
                {formatNumber(user.engagement?.followers || 0)}
              </Text>
              <Text color="$mauve11">followers</Text>
            </View>
          </DebouncedLink>
        </XStack>
      </YStack>
    </>
  )
}

export default function UserScreen() {
  const { fid } = useLocalSearchParams()
  const { user } = useUser(fid as string)

  if (!user) {
    return <LoadingScreen />
  }

  return (
    <View flex={1}>
      <Panels
        renderHeader={() => <UserHeader user={user} />}
        panels={[
          {
            name: 'Casts',
            panel: <CastPanel fid={fid as string} />,
          },
          {
            name: 'Replies',
            panel: <ReplyPanel fid={fid as string} />,
          },
          {
            name: 'Media',
            panel: <MediaPanel fid={fid as string} />,
          },
          {
            name: 'Frames',
            panel: <FramesPanel fid={fid as string} />,
          },
          {
            name: 'Addresses',
            panel: <VerifiedAddresses user={user} />,
          },
        ]}
        defaultIndex={0}
      />
    </View>
  )
}

const CastPanel = ({ fid }: { fid: string }) => {
  const height = useBottomTabBarHeight()
  const { fetchPage } = useCastFeed({
    users: {
      type: UserFilterType.FIDS,
      data: {
        fids: [fid],
      },
    },
  })
  return (
    <FarcasterFeedPanel
      keys={['userPosts', fid]}
      fetch={fetchPage}
      asTabs
      paddingBottom={height}
    />
  )
}

const ReplyPanel = ({ fid }: { fid: string }) => {
  const height = useBottomTabBarHeight()
  const { fetchPage } = useCastFeed({
    users: {
      type: UserFilterType.FIDS,
      data: {
        fids: [fid],
      },
    },
    onlyReplies: true,
  })
  return (
    <FarcasterFeedPanel
      keys={['userReplies', fid]}
      fetch={fetchPage}
      asTabs
      paddingBottom={height}
    />
  )
}

const MediaPanel = ({ fid }: { fid: string }) => {
  const height = useBottomTabBarHeight()
  const { fetchPage } = useCastFeed({
    users: {
      type: UserFilterType.FIDS,
      data: {
        fids: [fid],
      },
    },
    contentTypes: ['image', 'video'],
  })
  return (
    <FarcasterFeedPanel
      keys={['userMedia', fid]}
      fetch={fetchPage}
      display={PanelDisplay.GRID}
      asTabs
      paddingBottom={height}
    />
  )
}

const FramesPanel = ({ fid }: { fid: string }) => {
  const height = useBottomTabBarHeight()
  const { fetchPage } = useCastFeed({
    users: {
      type: UserFilterType.FIDS,
      data: {
        fids: [fid],
      },
    },
    onlyFrames: true,
  })
  return (
    <FarcasterFeedPanel
      keys={['userFrames', fid]}
      fetch={fetchPage}
      asTabs
      paddingBottom={height}
    />
  )
}

const VerifiedAddresses = ({ user }: { user: FarcasterUser }) => {
  const toast = useToastController()

  return (
    <Tabs.ScrollView>
      <YStack gap="$4" padding="$3">
        {user?.verifiedAddresses?.map(({ protocol, address }) => (
          <XStack key={address} justifyContent="space-between" alignItems="center">
            <TouchableOpacity
              onPress={() => {
                Clipboard.setStringAsync(address)
                toast.show('Copied address')
                haptics.selection()
              }}
            >
              <XStack alignItems="center" gap="$2">
                <View overflow="hidden">
                  <Image
                    source={
                      protocol === 1
                        ? CHAIN_DATA[Chain.SOLANA].icon
                        : CHAIN_DATA[Chain.ETHEREUM].icon
                    }
                    style={{ width: 16, height: 16 }}
                  />
                </View>
                <Text fontSize="$5" numberOfLines={1} color="$mauve12">
                  {formatAddress(address)}
                </Text>
                <Copy size={12} color="$mauve11" />
              </XStack>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(
                  protocol === 0
                    ? `https://www.onceupon.gg/${address}`
                    : `https://solscan.io/account/${address}`
                )
              }}
            >
              <XStack gap="$1">
                <Text color="$mauve11">View on explorer</Text>
                <ExternalLink size={16} color="$mauve11" />
              </XStack>
            </TouchableOpacity>
          </XStack>
        ))}
        {user?.verifiedAddresses?.length === 0 && (
          <Text color="$mauve12" alignSelf="center">
            No verified addresses
          </Text>
        )}
      </YStack>
    </Tabs.ScrollView>
  )
}
