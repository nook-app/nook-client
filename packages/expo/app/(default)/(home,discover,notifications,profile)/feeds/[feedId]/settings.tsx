import { FormComponent } from '@/components/form/Form'
import { useCreateFeed } from '@/hooks/useCreateFeed'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { KeyboardAvoidingView } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ScrollView, Spinner, Text, View, YStack } from 'tamagui'
import { useHeaderHeight } from '@react-navigation/elements'
import { FORM_FOR_TYPE } from '@/utils/feed'
import { useAuth } from '@/context/auth'
import { useCallback } from 'react'
import { Feed } from '@/types'
import { LoadingScreen } from '@/components/LoadingScreen'

export default function UpdateFeedScreen() {
  const { feedId } = useLocalSearchParams()
  const { feeds } = useAuth()

  const feed = feeds.find((feed) => feed.id === feedId)

  if (!feed) {
    return (
      <>
        <Stack.Screen
          options={{
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  router.back()
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View>
                  <Text>Cancel</Text>
                </View>
              </TouchableOpacity>
            ),
          }}
        />
        <LoadingScreen />
      </>
    )
  }

  return <UpdateFeed feed={feed} />
}

const UpdateFeed = ({ feed }: { feed: Feed }) => {
  const headerHeight = useHeaderHeight()
  const { setFieldValue, setErrorState, update, isLoading, hasErrors, data } =
    useCreateFeed(feed)

  const form = FORM_FOR_TYPE[feed?.type || 'default']

  const disabled =
    hasErrors || !form.every(({ field, required }) => !required || !!data[field])

  const getFieldValue = useCallback(
    (key: string) => {
      const keys = key.split('.')
      let currentObj = data
      for (let i = 0; i < keys.length; i++) {
        const currentKey = keys[i]
        if (currentObj[currentKey] === undefined) {
          return undefined
        }
        currentObj = currentObj[currentKey]
      }
      return currentObj
    },
    [data]
  )

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                router.back()
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View>
                <Text>Cancel</Text>
              </View>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={update}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={isLoading || disabled}
            >
              <View>
                {isLoading ? (
                  <Spinner />
                ) : (
                  <Text color={disabled ? '$mauve9' : '$mauve12'}>Save</Text>
                )}
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <View flex={1} backgroundColor="$color1">
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: headerHeight }}>
            <YStack padding="$3" gap="$3">
              <Text fontWeight="600" fontSize="$7">
                {`Update ${feed.name}`}
              </Text>
              <YStack gap="$6">
                {form.map((field) => {
                  return (
                    <FormComponent
                      key={field.field}
                      field={field}
                      setFieldValue={setFieldValue}
                      setErrorState={setErrorState}
                      defaultValue={getFieldValue(field.field)}
                    />
                  )
                })}
              </YStack>
            </YStack>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  )
}
