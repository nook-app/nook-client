import { XCircle } from '@tamagui/lucide-icons'
import { Button, Text, Input as TInput, View, XStack } from 'tamagui'
import { YStack } from 'tamagui'
import { Label } from './Label'

export const Input = ({
  value,
  onChangeText,
  label,
  placeholder,
  isOptional,
  keyboardType,
  ...rest
}: {
  value: string
  onChangeText: (text: string) => void
  label?: string
  placeholder: string
  isOptional?: boolean
  keyboardType?: 'default' | 'number-pad'
  [key: string]: any
}) => {
  return (
    <YStack gap="$1.5">
      {label && (
        <XStack gap="$0.5" alignItems="center">
          <Label>{label}</Label>
          {isOptional ? (
            <Text color="$mauve8" fontSize={10} verticalAlign="middle" fontWeight="500">
              (optional)
            </Text>
          ) : (
            <Text color="$red9" fontSize={10} verticalAlign="middle" fontWeight="500">
              *
            </Text>
          )}
        </XStack>
      )}
      <YStack position="relative">
        <TInput
          backgroundColor="$color3"
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          paddingRight="$7"
          {...rest}
        />
        {value && (
          <Button
            onPress={() => onChangeText('')}
            position="absolute"
            right="$2"
            top={0}
            y={0}
            accessibilityLabel="Clear input"
            padding="$2"
            borderWidth="$0"
            pressStyle={{
              borderColor: '$backgroundTransparent',
            }}
            variant="outlined"
          >
            <XCircle size={16} color="$mauve12" />
          </Button>
        )}
      </YStack>
    </YStack>
  )
}
