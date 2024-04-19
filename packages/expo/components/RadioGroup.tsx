import { Fragment, useEffect, useState } from 'react'
import { Separator, Text, YStack } from 'tamagui'
import { XStack, RadioGroup as TRadioGroup, Label, View } from 'tamagui'

export const RadioGroup = ({
  onValueChange,
  label,
  options,
}: {
  onValueChange: (value: string) => void
  label: string
  options: { value: string; label: string; description: string }[]
}) => {
  const [value, setValue] = useState<string>()

  useEffect(() => {
    if (options.length) {
      setValue(options[0].value)
    }
  }, [])

  return (
    <YStack gap="$1.5">
      <View paddingLeft="$1.5">
        <Text textTransform="uppercase" color="$mauve11" fontSize="$2" fontWeight="600">
          {label}
        </Text>
      </View>
      <TRadioGroup
        onValueChange={(e) => {
          setValue(e)
          onValueChange(e)
        }}
        backgroundColor="$color4"
        value={value}
      >
        {options.map((option, i) => (
          <Fragment key={option.value}>
            <RadioGroupItem {...option} />
            {i !== options.length - 1 && <Separator borderColor="$color6" />}
          </Fragment>
        ))}
      </TRadioGroup>
    </YStack>
  )
}

const RadioGroupItem = ({
  value,
  label,
  description,
}: { value: string; label: string; description: string }) => {
  return (
    <XStack alignItems="center" justifyContent="space-between" paddingHorizontal="$2">
      <Label htmlFor={value} unstyled flexGrow={1}>
        <View flexDirection="column" padding="$2" paddingVertical="$3">
          <Text fontWeight="500" fontSize="$5" color="$mauve12">
            {label}
          </Text>
          <Text color="$mauve11">{description}</Text>
        </View>
      </Label>
      <TRadioGroup.Item value={value} id={value}>
        <TRadioGroup.Indicator />
      </TRadioGroup.Item>
    </XStack>
  )
}
