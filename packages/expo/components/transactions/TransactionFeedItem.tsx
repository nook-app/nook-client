import {
  AssetType,
  ContextSummaryVariableType,
  TransactionContext,
  TransactionResponse,
} from '@/types/transactions'
import { formatTimeAgo } from '@/utils'
import { haptics } from '@/utils/haptics'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useLocalSearchParams } from 'expo-router'
import { Linking } from 'react-native'
import { TapGestureHandler } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { Text, View, XStack, YStack, useTheme } from 'tamagui'
import { formatEther } from 'viem'
import { UserAvatar } from '../UserAvatar'
import { DebouncedLink } from '../DebouncedLink'

const CHAINS: { [key: string]: { name: string; image: any } } = {
  1: {
    name: 'Ethereum',
    image: require('../../assets/ethereum.jpeg'),
  },
  10: {
    name: 'Optimism',
    image: require('../../assets/optimism.jpeg'),
  },
  424: {
    name: 'PGN',
    image: require('../../assets/pgn.png'),
  },
  8453: {
    name: 'Base',
    image: require('../../assets/base.jpeg'),
  },
  5101: {
    name: 'Frame',
    image: require('../../assets/frame.jpeg'),
  },
  34443: {
    name: 'Mode',
    image: require('../../assets/mode.png'),
  },
  7777777: {
    name: 'Zora',
    image: require('../../assets/zora.jpeg'),
  },
}

export const TransactionFeedItem = ({ tx }: { tx: TransactionResponse }) => {
  return (
    <YStack
      borderBottomWidth="$0.25"
      borderBottomColor="$borderColor"
      padding="$3"
      gap="$2"
    >
      <TransactionHeader tx={tx} />
      <View>
        <Text>{contextSummary(tx.context)}</Text>
      </View>
      <XStack alignSelf="flex-end" gap="$3">
        <TransactionQuoteButton tx={tx} />
        <TransactionLinkButton tx={tx} />
      </XStack>
    </YStack>
  )
}

const TransactionHeader = ({ tx }: { tx: TransactionResponse }) => {
  const { fid: activeFid } = useLocalSearchParams()
  const user = tx.enrichedParties[tx.from][0]

  const avatar = user?.farcaster?.avatar || user?.ensNew?.avatar
  const handle =
    user?.farcaster?.handle ||
    user?.ensNew?.handle ||
    `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`

  const href =
    user?.farcaster?.fid && activeFid !== user?.farcaster?.fid
      ? {
          pathname: `/users/[fid]`,
          params: { fid: user.farcaster.fid },
        }
      : {}

  return (
    <XStack justifyContent="space-between" alignItems="flex-start">
      <DebouncedLink href={href} asChild>
        <XStack gap="$2" alignItems="center">
          <UserAvatar pfp={avatar} size="$3" />
          <YStack>
            <Text fontWeight="600">{handle}</Text>
            <XStack alignItems="center" gap="$1.5">
              <Text>{formatTimeAgo(tx.timestamp * 1000)}</Text>
              <Text>on</Text>
              <TransactionChain chainId={tx.chainId} />
            </XStack>
          </YStack>
        </XStack>
      </DebouncedLink>
    </XStack>
  )
}

const TransactionChain = ({ chainId }: { chainId: number }) => {
  const chain = CHAINS[chainId]
  return (
    <XStack gap="$1.5" alignItems="center">
      <View borderRadius="$10" overflow="hidden">
        {chain && <Image source={chain.image} style={{ width: 16, height: 16 }} />}
      </View>
      <Text numberOfLines={1} ellipsizeMode="tail" fontWeight="500">
        {chain?.name || `chainId:${chainId}`}
      </Text>
    </XStack>
  )
}

export const TransactionQuoteButton = ({ tx }: { tx: TransactionResponse }) => {
  const theme = useTheme()

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
        params: {
          embed: `https://www.onceupon.gg/${tx.hash}`,
        },
      }}
      asChild
      onPress={animateScale}
    >
      <XStack gap="$1.5" alignItems="center">
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <MaterialCommunityIcons
            name="comment-quote-outline"
            size={20}
            color={theme.mauve11.val}
          />
        </Animated.View>
      </XStack>
    </DebouncedLink>
  )
}

export const TransactionLinkButton = ({ tx }: { tx: TransactionResponse }) => {
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
          haptics.selection()
          animateScale()
          Linking.openURL(`https://www.onceupon.gg/${tx.hash}`)
        }}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Image
            source={require('@/assets/onceupon.png')}
            style={{ width: 24, height: 20 }}
          />
        </Animated.View>
      </View>
    </TapGestureHandler>
  )
}

export function contextSummary(context: TransactionContext | undefined): string {
  if (!context || !context.summaries) return ''

  const regex = /(\[\[.*?\]\])/
  const parts = context.summaries.en.default.split(regex).filter((x) => x)

  const formattedParts = parts.map((part) => {
    if (isVariable(part)) {
      const variableName = part.slice(2, -2)

      const varContext =
        context.variables?.[variableName] ||
        context.summaries?.en.variables?.[variableName]

      if (!varContext) return part

      return formatSection(varContext)
    }
    return part
  })

  return formattedParts.join(' ')
}

function isVariable(str: string) {
  return str.startsWith('[[') && str.endsWith(']]')
}

function formatSection(section: ContextSummaryVariableType) {
  const varContext = section
  //@ts-ignore
  const unit = varContext['unit']

  if (varContext?.type === AssetType.ETH)
    return `${formatEther(BigInt(varContext?.value))}${unit ? ` ETH` : ''}`

  if (varContext?.type === AssetType.ERC721) {
    return `${varContext.token}${
      //@ts-ignore
      varContext['tokenId'] ? ` #${varContext['tokenId']}` : ''
    }`
  }

  if (varContext?.type === 'erc1155') {
    return `${varContext.value} ${varContext.token} #${varContext.tokenId}`
  }

  if (varContext?.type === 'erc20') return `${varContext.value} ${varContext.token}`

  return `${varContext.value}${unit ? ` ${unit}` : ''}`
}
