import { SheetState, SheetType, useSheet, useSheets } from '@/context/sheet'
import { View, Text, YStack, Spinner } from 'tamagui'
import { BaseSheet } from './BaseSheet'
import { Image } from 'expo-image'
import { useAuth } from '@/context/auth'
import { useEffect, useState } from 'react'
import { Linking } from 'react-native'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Device from 'expo-device'
import { Button } from '../Button'

export const EnableSignerSheet = () => {
  const insets = useSafeAreaInsets()
  const { sheet, closeSheet } = useSheet(SheetType.EnableSigner)
  const { session, signer, refreshSigner } = useAuth()
  const [error, setError] = useState<string | undefined>()
  const [isPolling, setIsPolling] = useState(false)

  useEffect(() => {
    if (signer?.state === 'completed') {
      closeSheet(SheetType.EnableSigner)
    }
  }, [signer])

  useEffect(() => {
    if (!sheet.isOpen) {
      setIsPolling(false)
    } else if (signer?.token) {
      refreshSigner(signer.token)
    }
  }, [sheet.isOpen])

  const pollRefresh = async () => {
    if (!signer || !session) return
    let currentAttempts = 0
    let maxAttempts = 60

    let state: string | undefined = signer?.state
    while (currentAttempts < maxAttempts && state !== 'completed') {
      state = await refreshSigner(signer.token)
      if (state === 'completed') {
        return
      }
      await new Promise((resolve) => setTimeout(resolve, 2000))
      currentAttempts++
    }

    setIsPolling(false)
    setError('Failed to enable Nook. Try again later.')
  }

  const handlePress = async () => {
    if (!signer || !session) return

    setIsPolling(true)

    // Do validation first in case user closed the sheet
    const validation = await refreshSigner(signer.token)
    if (validation === 'completed') {
      return
    }

    // Deep link into Warpcast, can't on dev
    if (Device.isDevice) {
      Linking.openURL(signer.deeplinkUrl)
    }

    // Poll for response
    try {
      await pollRefresh()
    } catch (e) {
      setError((e as Error).message)
      setIsPolling(false)
    }
  }

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
        <YStack paddingHorizontal="$3" gap="$3.5">
          <View borderRadius="$4" overflow="hidden" width="$5">
            <Image source={require('@/assets/icon.png')} style={{ aspectRatio: 1 }} />
          </View>
          <Text fontWeight="700" fontSize="$8" color="$mauve12">
            Enable Nook
          </Text>
          <Text color="$mauve12">
            Nook needs permissions from you through Warpcast to be able to perform write
            actions on Farcaster.
          </Text>
          {error && (
            <View alignSelf="center">
              <Text color="$red11" textAlign="center">
                {error}
              </Text>
            </View>
          )}
          <Button onPress={handlePress} disabled={isPolling}>
            {isPolling ? <Spinner /> : 'Enable Nook'}
          </Button>
        </YStack>
      </BottomSheetView>
    </BaseSheet>
  )
}
