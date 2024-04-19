import { SheetType, useSheet } from '@/context/sheet'
import { Spinner, Text, View, XStack, YStack } from 'tamagui'
import { BaseSheet } from './BaseSheet'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAccount, useSendTransaction, useSwitchNetwork } from 'wagmi'
import { Label } from '../Label'
import { formatAddress } from '@/utils'
import { CHAIN_BY_ID } from '@/utils/chains'
import { Image } from 'expo-image'
import { useEffect, useState } from 'react'
import { useToastController } from '@tamagui/toast'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useWeb3Modal } from '@web3modal/wagmi-react-native'
import { Button } from '../Button'

export const FrameTransactionSheet = () => {
  const { sheet, closeSheet } = useSheet(SheetType.FrameTransaction)
  const insets = useSafeAreaInsets()
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const { switchNetworkAsync } = useSwitchNetwork()
  const { sendTransactionAsync } = useSendTransaction()
  const toast = useToastController()
  const { open } = useWeb3Modal()
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    if (sheet.isOpen) {
      setIsLoading(false)
      setError(undefined)
    }
  }, [sheet.isOpen])

  if (!sheet.initialState?.data) return null

  const chainId = Number(sheet.initialState.data.chainId.replace('eip155:', ''))

  const handlePress = async () => {
    if (!sheet.initialState?.data) return

    setIsLoading(true)
    try {
      if (switchNetworkAsync) await switchNetworkAsync(chainId)

      const { hash } = await sendTransactionAsync({
        chainId,
        to: sheet.initialState.data.params.to,
        data: sheet.initialState.data.params.data,
        value: BigInt(sheet.initialState.data.params.value || 0),
      })

      if (hash) {
        toast.show('Submitted transaction')
        sheet.initialState.onSuccess?.(hash)
        closeSheet(SheetType.FrameTransaction)
      } else {
        toast.show('Error submitting transaction')
      }

      closeSheet(SheetType.FrameTransaction)
    } catch (e) {
      setError((e as Error).message)
    }
    setIsLoading(false)
  }

  const chain = CHAIN_BY_ID[chainId]

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
        <YStack padding="$4" gap="$4">
          <XStack alignItems="center" justifyContent="space-between">
            <Text fontWeight="700" fontSize="$8" color="$mauve12">
              Transaction
            </Text>
            <TouchableOpacity
              onPress={() => {
                closeSheet(SheetType.FrameTransaction)
                open()
              }}
            >
              <XStack
                gap="$2"
                alignItems="center"
                borderWidth="$0.5"
                borderColor="$color4"
                borderRadius="$10"
                padding="$2"
                paddingHorizontal="$3"
              >
                <View
                  width="$0.75"
                  height="$0.75"
                  borderRadius="$10"
                  backgroundColor={address ? '$green10' : '$red10'}
                />
                <Label>{address ? formatAddress(address) : 'No wallet connected'}</Label>
              </XStack>
            </TouchableOpacity>
          </XStack>
          <XStack gap="$4">
            <YStack gap="$2">
              <Label>Domain</Label>
              <Text>{sheet.initialState?.host}</Text>
            </YStack>
            <YStack gap="$2">
              <Label>Chain</Label>
              <XStack gap="$1.5" alignItems="center">
                <View borderRadius="$10" overflow="hidden">
                  <Image source={chain.icon} style={{ width: 16, height: 16 }} />
                </View>
                <Text>{chain.name}</Text>
              </XStack>
            </YStack>
          </XStack>
          <Text>
            Please make sure you trust this transaction source before proceeding. Nook is
            not responsible for any lost assets.
          </Text>
          {error && (
            <YStack backgroundColor="$red3" borderRadius="$4" padding="$2" gap="$1">
              <Text
                textTransform="uppercase"
                color="$red11"
                fontSize="$1"
                fontWeight="600"
                letterSpacing={0.5}
              >
                Error
              </Text>
              <Text color="$red11">{error}</Text>
            </YStack>
          )}
          <Button onPress={handlePress} disabled={isLoading || !!error}>
            {isLoading ? (
              <Spinner />
            ) : (
              <Text color={isLoading || !!error ? '$mauve8' : '$mauve12'}>
                Continue in wallet
              </Text>
            )}
          </Button>
        </YStack>
      </BottomSheetView>
    </BaseSheet>
  )
}
