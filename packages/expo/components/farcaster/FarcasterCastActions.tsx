import { useCast } from '@/hooks/useCast'
import { View, XStack, useTheme } from 'tamagui'
import { TapGestureHandler } from 'react-native-gesture-handler'
import { SheetType, useSheets } from '@/context/sheet'
import { CastAction, useCastActions } from '@/hooks/useCastActions'
import Animated, {
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { Heart, MessageSquare, Repeat2, Send } from '@tamagui/lucide-icons'
import { Image } from 'expo-image'
import { useAuth } from '@/context/auth'
import { Text } from 'tamagui'
import { FarcasterCastCustomAction } from './FarcasterCastCustomAction'
import { DebouncedLink } from '../DebouncedLink'

export const FarcasterCastLikeButton = ({
  hash,
  noWidth,
}: { hash: string; noWidth?: boolean }) => {
  const { dispatch } = useCastActions(hash)
  const theme = useTheme()
  const { cast } = useCast(hash)

  const scaleAnim = useSharedValue(1)

  const animateScale = () => {
    scaleAnim.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withTiming(1, { duration: 100 })
    )
  }

  return (
    <TapGestureHandler>
      <XStack
        onPress={() => {
          animateScale()
          dispatch(cast?.context?.liked ? CastAction.UnlikeCast : CastAction.LikeCast)
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        minWidth={noWidth ? undefined : '$3.5'}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          {cast?.context?.liked ? (
            <Heart size={20} color="$red9" fill={theme.red9.val} />
          ) : (
            <Heart size={20} color="$mauve9" />
          )}
        </Animated.View>
      </XStack>
    </TapGestureHandler>
  )
}

export const FarcasterCastRecastButton = ({
  hash,
  noWidth,
}: { hash: string; noWidth?: boolean }) => {
  const { openSheet } = useSheets()
  const { dispatch } = useCastActions(hash)
  const { cast } = useCast(hash)

  const scaleAnim = useSharedValue(1)

  const animateScale = () => {
    scaleAnim.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withTiming(1, { duration: 100 })
    )
  }

  return (
    <TapGestureHandler>
      <XStack
        onPress={() => {
          animateScale()
          if (cast?.context?.recasted) {
            dispatch(CastAction.UnrecastCast)
          } else {
            openSheet(SheetType.RecastAction, { hash })
          }
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        minWidth={noWidth ? undefined : '$3.5'}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          {cast?.context?.recasted ? (
            <Repeat2 size={24} color="$green9" />
          ) : (
            <Repeat2 size={24} color="$mauve9" />
          )}
        </Animated.View>
      </XStack>
    </TapGestureHandler>
  )
}

export const FarcasterCastReplyButton = ({
  hash,
  noWidth,
}: { hash: string; noWidth?: boolean }) => {
  const scaleAnim = useSharedValue(1)

  const animateScale = () => {
    scaleAnim.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withTiming(1, { duration: 100 })
    )
  }

  return (
    <DebouncedLink
      href={{
        pathname: `/create/post`,
        params: { parentHash: hash },
      }}
      asChild
      onPress={animateScale}
    >
      <XStack
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        minWidth={noWidth ? undefined : '$3.5'}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <MessageSquare size={20} color="$mauve9" />
        </Animated.View>
      </XStack>
    </DebouncedLink>
  )
}

export const FarcasterCastTipButton = ({
  hash,
  noWidth,
}: { hash: string; noWidth?: boolean }) => {
  const theme = useTheme()
  const { openSheet } = useSheets()

  const scaleAnim = useSharedValue(1)

  const animateScale = () => {
    scaleAnim.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withTiming(1, { duration: 100 })
    )
  }

  return (
    <TapGestureHandler>
      <View
        onPress={() => {
          animateScale()
          openSheet(SheetType.DegenTip, { hash })
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        minWidth={noWidth ? undefined : '$3.5'}
        alignItems="center"
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image
            source={require('@/assets/degen.svg')}
            style={{ width: 19, height: 16 }}
            tintColor={theme.mauve9.val}
          />
        </Animated.View>
      </View>
    </TapGestureHandler>
  )
}

export const FarcasterCastActionBar = ({
  hash,
  padding,
}: { hash: string; padding?: string }) => {
  const { metadata } = useAuth()

  return (
    <DebouncedLink
      href={{
        pathname: `/casts/[hash]`,
        params: { hash },
      }}
      asChild
    >
      <XStack
        justifyContent="space-between"
        alignItems="center"
        paddingVertical={padding || '$1.5'}
      >
        <XStack alignItems="center">
          <FarcasterCastReplyButton hash={hash} />
          <FarcasterCastRecastButton hash={hash} />
          <FarcasterCastLikeButton hash={hash} />
          <FarcasterCastCustomAction hash={hash} />
        </XStack>
        <XStack alignItems="center">
          {metadata?.enableDegenTip && <FarcasterCastTipButton hash={hash} />}
        </XStack>
      </XStack>
    </DebouncedLink>
  )
}

export const FarcasterCastActionCounts = ({ hash }: { hash: string }) => {
  const { cast } = useCast(hash)

  const replies = cast?.engagement?.replies || 0
  const likes = cast?.engagement?.likes || 0

  if (!cast || (replies === 0 && likes === 0)) return null

  return (
    <XStack gap="$2" alignItems="center">
      {cast.engagement?.replies > 0 && (
        <XStack gap="$1.5" alignItems="center">
          <Text color="$mauve12" fontWeight="500">
            {cast.engagement.replies}
          </Text>
          <Text color="$mauve9">
            {cast.engagement.replies === 1 ? 'reply' : 'replies'}
          </Text>
        </XStack>
      )}
      {cast.engagement?.likes > 0 && (
        <XStack gap="$1.5" alignItems="center">
          <Text color="$mauve12" fontWeight="500">
            {cast.engagement.likes}
          </Text>
          <Text color="$mauve9">{cast.engagement.likes === 1 ? 'like' : 'likes'}</Text>
        </XStack>
      )}
    </XStack>
  )
}
