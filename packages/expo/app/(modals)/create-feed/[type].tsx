import { FormComponent } from '@/components/form/Form'
import { useCreateFeed } from '@/hooks/useCreateFeed'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { KeyboardAvoidingView } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ScrollView, Spinner, Text, View, YStack } from 'tamagui'
import { useHeaderHeight } from '@react-navigation/elements'
import { FORM_FOR_TYPE } from '@/utils/feed'
import { useEffect } from 'react'

export default function CreateCastFeedScreen() {
  const headerHeight = useHeaderHeight()
  const { type } = useLocalSearchParams()
  const { setFieldValue, setErrorState, create, isLoading, hasErrors, data } =
    useCreateFeed()

  useEffect(() => {
    setFieldValue('type', type)
  }, [type])

  const form = FORM_FOR_TYPE[(type || 'default') as string]

  const disabled =
    hasErrors || !form.every(({ field, required }) => !required || !!data[field])

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
              onPress={create}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={isLoading || disabled}
            >
              <View>
                {isLoading ? (
                  <Spinner />
                ) : (
                  <Text color={disabled ? '$mauve9' : '$mauve12'}>Create</Text>
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
                {`Create ${type === 'default' ? 'cast' : type} feed`}
              </Text>
              <YStack gap="$6">
                {form.map((field) => {
                  return (
                    <FormComponent
                      key={field.field}
                      field={field}
                      setFieldValue={setFieldValue}
                      setErrorState={setErrorState}
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
