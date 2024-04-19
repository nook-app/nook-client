import { FarcasterCast, UrlContentResponse } from '@/types'
import { ExternalLink } from '@tamagui/lucide-icons'
import { Image } from 'expo-image'
import { Linking } from 'react-native'
import { TapGestureHandler } from 'react-native-gesture-handler'
import { Spinner, Text, View, XStack, YStack, useTheme } from 'tamagui'
import { Frame, FrameButton } from '@/types/frames'
import { useEffect, useRef, useState } from 'react'
import { submitFrameAction } from '@/utils/api'
import { useToastController } from '@tamagui/toast'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { Input } from '../Input'
import { Label } from '../Label'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAccount } from 'wagmi'
import { SheetType, useSheets } from '@/context/sheet'
import { useWeb3Modal } from '@web3modal/wagmi-react-native'
import { useAuth } from '@/context/auth'
import { router } from 'expo-router'
import { Button } from '../Button'

export const EmbedFrame = ({
  cast,
  content,
}: { cast?: FarcasterCast; content: UrlContentResponse }) => {
  const toast = useToastController()
  const [frame, setFrame] = useState<Frame | undefined>(content.frame)
  const [inputText, setInputText] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const opacity = useSharedValue(1)
  const { address } = useAccount()
  const { openSheet } = useSheets()
  const { open } = useWeb3Modal()
  const { signer } = useAuth()
  const frameRef = useRef(content.frame?.image)

  if (frameRef.current !== content.frame?.image) {
    setFrame(content.frame)
    frameRef.current = content.frame?.image
  }

  useEffect(() => {
    opacity.value = withTiming(isLoading ? 0 : 1, { duration: 500 })
  }, [isLoading, opacity])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    }
  })

  if (!frame) return null

  const topButtons = frame.buttons?.slice(0, 2) || []
  const bottomButtons = frame.buttons?.slice(2, 4) || []

  const handleLink = (url: string) => {
    const remappedLocation = url.replace(
      'warpcast.com/~/add-cast-action',
      'nook.social/~/add-cast-action'
    )
    if (remappedLocation.startsWith('https://nook.social/~/add-cast-action')) {
      const remappedUrl = new URL(remappedLocation)
      router.push({
        pathname: `/~/add-cast-action`,
        params: {
          ...Object.fromEntries(remappedUrl.searchParams),
        },
      })
    } else {
      Linking.openURL(url)
    }
  }

  const handlePress = async (frameButton: FrameButton, index: number) => {
    if (!frame) return

    if (signer?.state !== 'completed') {
      openSheet(SheetType.EnableSigner)
      return
    }

    const postUrl = frameButton.target ?? frame.postUrl ?? content.uri
    if (
      frameButton.action === 'post' ||
      frameButton.action === 'post_redirect' ||
      !frameButton.action
    ) {
      try {
        setIsLoading(true)
        const response = await submitFrameAction({
          url: content.uri || '',
          castFid: cast?.user.fid || '0',
          castHash: cast?.hash || '0x0000000000000000000000000000000000000000',
          action: frameButton.action,
          buttonIndex: index + 1,
          postUrl: postUrl,
          inputText: inputText,
          state: frame.state,
        })
        if ('message' in response) {
          toast.show(response.message)
        } else if (response.location) {
          handleLink(response.location)
        } else if (response.frame) {
          setFrame(response.frame)
        }
        setInputText(undefined)
      } catch (err) {
        toast.show('Could not fetch frame')
      }
      setIsLoading(false)
    } else if (frameButton.action === 'link') {
      handleLink(frameButton.target)
    } else if (frameButton.action === 'mint') {
      Linking.openURL(frame.postUrl)
    } else if (frameButton.action === 'tx') {
      if (!address) {
        open()
        return
      }
      try {
        const response = await submitFrameAction({
          url: content.uri || '',
          castFid: cast?.user.fid || '0',
          castHash: cast?.hash || '0x0000000000000000000000000000000000000000',
          action: frameButton.action,
          buttonIndex: index + 1,
          postUrl: postUrl,
          inputText: inputText,
          state: frame.state,
          address,
        })
        if ('message' in response) {
          toast.show(response.message)
        } else if (response.transaction) {
          openSheet(SheetType.FrameTransaction, {
            host: content.host || '',
            data: response.transaction,
            onSuccess: async (hash) => {
              try {
                setIsLoading(true)
                const response = await submitFrameAction({
                  url: content.uri || '',
                  castFid: cast?.user.fid || '0',
                  castHash: cast?.hash || '0x0000000000000000000000000000000000000000',
                  action: 'post',
                  buttonIndex: index + 1,
                  postUrl: postUrl,
                  inputText: inputText,
                  state: frame.state,
                  address,
                  transactionId: hash,
                })
                if ('message' in response) {
                  toast.show(response.message)
                } else if (response.location) {
                  Linking.openURL(response.location)
                } else if (response.frame) {
                  setFrame(response.frame)
                }
                setInputText(undefined)
              } catch (err) {
                toast.show('Could not fetch frame')
              }
              setIsLoading(false)
            },
          })
        } else {
          toast.show('No transaction found')
        }
      } catch (err) {
        toast.show('Could not fetch frame')
      }
    }
  }

  return (
    <YStack gap="$2">
      <YStack borderRadius="$4" overflow="hidden">
        <View
          backgroundColor="$color3"
          justifyContent="center"
          alignItems="center"
          position="absolute"
          top={0}
          bottom={0}
          left={0}
          right={0}
        >
          {isLoading ? <Spinner /> : null}
        </View>
        <Animated.View style={animatedStyle}>
          {frame.image && (
            <TapGestureHandler>
              <View
                style={{ position: 'relative' }}
                onPress={() => Linking.openURL(content.uri)}
              >
                <Image
                  recyclingKey={frame.image}
                  source={{ uri: frame.image }}
                  style={{
                    aspectRatio: frame.imageAspectRatio === '1:1' ? 1 : 1.91,
                  }}
                />
              </View>
            </TapGestureHandler>
          )}
          <YStack
            backgroundColor="$color2"
            padding="$2"
            gap="$2"
            borderColor="$borderColor"
            borderLeftWidth="$0.25"
            borderRightWidth="$0.25"
            borderBottomWidth="$0.25"
            borderBottomLeftRadius="$4"
            borderBottomRightRadius="$4"
          >
            {frame.inputText && (
              <Input
                value={inputText || ''}
                onChangeText={setInputText}
                placeholder={frame.inputText}
                backgroundColor="$color3"
                borderRadius="$4"
              />
            )}
            {topButtons.length > 0 && (
              <XStack gap="$2">
                {topButtons.map((button, index) => (
                  <FrameButtonAction
                    button={button}
                    onPress={() => handlePress(button, index)}
                    key={index}
                  />
                ))}
              </XStack>
            )}
            {bottomButtons.length > 0 && (
              <XStack gap="$2">
                {bottomButtons.map((button, index) => (
                  <FrameButtonAction
                    button={button}
                    onPress={() => handlePress(button, 2 + index)}
                    key={index}
                  />
                ))}
              </XStack>
            )}
          </YStack>
        </Animated.View>
      </YStack>
      {content.host && (
        <View alignSelf="flex-end">
          <Label>{content.host.replaceAll('www.', '')}</Label>
        </View>
      )}
    </YStack>
  )
}

const FrameButtonAction = ({
  button,
  onPress,
}: { button: FrameButton; onPress: () => void }) => {
  const theme = useTheme()
  return (
    <View flex={1}>
      <Button onPress={onPress}>
        <Text
          alignItems="center"
          gap="$1.5"
          flexShrink={1}
          paddingHorizontal="$1"
          flexWrap="nowrap"
          numberOfLines={2}
          textAlign="center"
          fontWeight="500"
        >
          {button.action === 'tx' && (
            <>
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={12}
                color={theme.mauve12.val}
              />{' '}
            </>
          )}
          <Text textAlign="center" fontWeight="500">
            {button.label}
          </Text>
          {button.action === 'link' ||
          button.action === 'post_redirect' ||
          button.action === 'mint' ? (
            <>
              {' '}
              <ExternalLink size={12} />
            </>
          ) : null}
        </Text>
      </Button>
    </View>
  )
}
