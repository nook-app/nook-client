import { SheetType, useSheet } from '@/context/sheet'
import { BaseSheet } from './BaseSheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Label } from '../Label'
import { Input } from '../Input'
import { View, XStack, YStack } from 'tamagui'
import { Text } from 'tamagui'
import { useActions } from '@/context/actions'
import { haptics } from '@/utils/haptics'
import { useEffect, useState } from 'react'
import { useToastController } from '@tamagui/toast'
import { stringToColor } from '@/utils'
import { KeyboardAvoidingView } from 'react-native'
import { Octicons } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native-gesture-handler'

export const AddActionSheet = () => {
  const { sheet, closeAllSheets } = useSheet(SheetType.AddAction)
  const insets = useSafeAreaInsets()
  const { updateAction } = useActions()
  const [url, setUrl] = useState('')
  const toast = useToastController()
  const [params, setParams] = useState<{
    name: string
    icon: string
    actionType: string
    postUrl: string
    host: string
  }>({
    name: '',
    icon: '',
    actionType: '',
    postUrl: '',
    host: '',
  })

  useEffect(() => {
    if (sheet.isOpen) {
      setUrl('')
      setParams({
        name: '',
        icon: '',
        actionType: '',
        postUrl: '',
        host: '',
      })
    }
  }, [sheet.isOpen])

  useEffect(() => {
    try {
      const urlObj = new URL(url)
      setParams({
        name: urlObj.searchParams.get('name') || '',
        icon: urlObj.searchParams.get('icon') || '',
        actionType: urlObj.searchParams.get('actionType') || '',
        postUrl: urlObj.searchParams.get('postUrl') || '',
        host: urlObj.host,
      })
    } catch (e) {
      return
    }
  }, [url])

  const handleImport = async () => {
    if (sheet.initialState?.index === null || sheet.initialState?.index === undefined)
      return

    if (!params.name || !params.icon || !params.actionType || !params.postUrl) {
      haptics.notificationError()
      toast.show('Invalid URL')
      return
    }

    haptics.notificationSuccess()
    closeAllSheets()
    await updateAction(sheet.initialState.index, {
      name: params.name,
      icon: params.icon,
      actionType: params.actionType,
      postUrl: params.postUrl,
    })
  }

  return (
    <BaseSheet sheet={sheet}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <YStack
          gap="$6"
          style={{
            paddingBottom: insets.bottom,
          }}
        >
          <XStack
            alignItems="center"
            justifyContent="space-between"
            paddingHorizontal="$2"
          >
            <Text fontWeight="600" fontSize="$8" color="$mauve12">
              Import Action
            </Text>
            <TouchableOpacity
              onPress={handleImport}
              disabled={
                !params.name || !params.icon || !params.actionType || !params.postUrl
              }
            >
              <View padding="$2">
                <Text
                  color={
                    !params.name || !params.icon || !params.actionType || !params.postUrl
                      ? '$mauve10'
                      : '$mauve12'
                  }
                  fontWeight="500"
                >
                  Import
                </Text>
              </View>
            </TouchableOpacity>
          </XStack>
          <YStack gap="$2">
            <View paddingHorizontal="$2">
              <Label>Import an action from a URL</Label>
            </View>
            <Input
              placeholder="Enter URL..."
              value={url}
              onChangeText={setUrl}
              autoFocus
            />
            <YStack height="$10">
              {params.name && params.icon && params.actionType && params.postUrl && (
                <XStack
                  justifyContent="space-between"
                  alignItems="center"
                  marginHorizontal="$2"
                  marginVertical="$3"
                >
                  <XStack alignItems="center" gap="$2" flexShrink={1}>
                    <View
                      width="$4"
                      height="$4"
                      alignItems="center"
                      justifyContent="center"
                      borderRadius="$4"
                      backgroundColor={stringToColor(params.name)}
                    >
                      {/* @ts-ignore */}
                      <Octicons name={params.icon} size={24} color="white" />
                    </View>
                    <YStack gap="$1" flexShrink={1}>
                      <Text fontWeight="600" fontSize="$6">
                        {params.name}
                      </Text>
                      <Text numberOfLines={1} color="$mauve11">
                        {params.host}
                      </Text>
                    </YStack>
                  </XStack>
                </XStack>
              )}
            </YStack>
          </YStack>
        </YStack>
      </KeyboardAvoidingView>
    </BaseSheet>
  )
}
