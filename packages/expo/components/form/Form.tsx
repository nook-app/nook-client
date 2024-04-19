import {
  Button,
  Image,
  RadioGroup,
  Spinner,
  Switch,
  Text,
  View,
  XStack,
  YStack,
  useDebounceValue,
  Label as TLabel,
} from 'tamagui'
import { Label } from '@/components/Label'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { SheetType, useSheets } from '@/context/sheet'
import {
  Channel,
  ChannelFilter,
  ChannelFilterType,
  FarcasterUser,
  FormComponentInput,
  FormComponentMultiInput,
  FormComponentSelect,
  FormComponentSelectChannels,
  FormComponentSelectUsers,
  FormComponentSwitch,
  FormComponentType,
  FormComponentUrl,
  FormField,
  UserFilter,
  UserFilterType,
} from '@/types'
import { memo, useEffect, useState } from 'react'
import { Input } from '@/components/Input'
import { ChevronDown, XCircle } from '@tamagui/lucide-icons'
import { useQuery } from '@tanstack/react-query'
import { fetchContent, fetchUsers } from '@/utils/api'
import { fetchChannels } from '@/utils/api/channel'

export const FormComponent = memo(
  ({
    field,
    setFieldValue,
    setErrorState,
    defaultValue,
  }: {
    field: FormField
    setFieldValue: (field: string, value: any) => void
    setErrorState: (field: string, error: boolean) => void
    defaultValue?: any
  }) => {
    return (
      <YStack gap="$2">
        <XStack gap="$0.5" alignItems="center">
          <Label>{field.name}</Label>
          {field.required ? (
            <Text color="$red9" fontSize={10} verticalAlign="middle" fontWeight="500">
              *
            </Text>
          ) : (
            <Text color="$mauve8" fontSize={10} verticalAlign="middle" fontWeight="500">
              (optional)
            </Text>
          )}
        </XStack>
        <FormComponentItem
          field={field}
          setFieldValue={setFieldValue}
          setErrorState={setErrorState}
          defaultValue={defaultValue}
        />
      </YStack>
    )
  }
)

const FormComponentItem = ({
  field,
  setFieldValue,
  setErrorState,
  defaultValue,
}: {
  field: FormField
  setFieldValue: (field: string, value: any) => void
  setErrorState: (field: string, error: boolean) => void
  defaultValue?: any
}) => {
  switch (field.component.type) {
    case FormComponentType.SELECT_USERS:
      return (
        <SelectUsersComponent
          field={field as FormField<FormComponentSelectUsers>}
          setFieldValue={setFieldValue}
          setErrorState={setErrorState}
          defaultValue={defaultValue as UserFilter}
        />
      )
    case FormComponentType.SELECT_CHANNELS:
      return (
        <SelectChannelsComponent
          field={field as FormField<FormComponentSelectChannels>}
          setFieldValue={setFieldValue}
          setErrorState={setErrorState}
          defaultValue={defaultValue as ChannelFilter}
        />
      )
    case FormComponentType.INPUT:
      return (
        <InputComponent
          field={field as FormField<FormComponentInput>}
          setFieldValue={setFieldValue}
          setErrorState={setErrorState}
          defaultValue={defaultValue as string}
        />
      )
    case FormComponentType.SWITCH:
      return (
        <SwitchComponent
          field={field as FormField<FormComponentSwitch>}
          setFieldValue={setFieldValue}
          setErrorState={setErrorState}
          defaultValue={defaultValue as boolean}
        />
      )
    case FormComponentType.MULTI_INPUT:
      return (
        <MultiInputComponent
          field={field as FormField<FormComponentMultiInput>}
          setFieldValue={setFieldValue}
          setErrorState={setErrorState}
          defaultValue={defaultValue as string[]}
        />
      )
    case FormComponentType.SELECT_OPTION:
      return (
        <SelectOptionComponent
          field={field as FormField<FormComponentSelect>}
          setFieldValue={setFieldValue}
          setErrorState={setErrorState}
          defaultValue={defaultValue as string}
        />
      )
    case FormComponentType.URL:
      return (
        <UrlComponent
          field={field as FormField<FormComponentUrl>}
          setFieldValue={setFieldValue}
          setErrorState={setErrorState}
          defaultValue={defaultValue as string}
        />
      )
    default:
      return null
  }
}

const SelectUsersComponent = ({
  field,
  setFieldValue,
  setErrorState,
  defaultValue,
}: {
  field: FormField<FormComponentSelectUsers>
  setFieldValue: (field: string, value: any) => void
  setErrorState: (field: string, error: boolean) => void
  defaultValue?: UserFilter
}) => {
  const [type, setType] = useState<UserFilterType | 'any'>(defaultValue?.type || 'any')
  const [fidValue, setFidValue] = useState()

  useEffect(() => {
    setFieldValue(field.field, fidValue)
  }, [fidValue])

  const handleSetType = (type: string) => {
    if (type === UserFilterType.POWER_BADGE) {
      setFieldValue(field.field, {
        type: UserFilterType.POWER_BADGE,
        data: { badge: true },
      })
    } else if (type === 'any') {
      setFieldValue(field.field, undefined)
    }
    setType(type as UserFilterType)
  }

  if (field.component.allowed.length === 1) {
    return (
      <SelectIndividualUsersComponent
        field={field}
        setFieldValue={setFieldValue}
        setErrorState={setErrorState}
        defaultValue={defaultValue}
      />
    )
  }

  return (
    <YStack gap="$2.5">
      <RadioGroup value={type} onValueChange={handleSetType} flexDirection="row" gap="$4">
        <XStack alignItems="center" gap="$2">
          <RadioGroup.Item value="any" id="any">
            <RadioGroup.Indicator />
          </RadioGroup.Item>
          <TLabel unstyled htmlFor="any">
            <Label>Everyone</Label>
          </TLabel>
        </XStack>
        {field.component.allowed.map((t) => (
          <XStack alignItems="center" gap="$2" key={t}>
            <RadioGroup.Item value={t} id={t}>
              <RadioGroup.Indicator />
            </RadioGroup.Item>
            <TLabel unstyled htmlFor={t}>
              <Label>
                {t === UserFilterType.FIDS
                  ? 'Select Users'
                  : t.split('_').join(' ').toLowerCase()}
              </Label>
            </TLabel>
          </XStack>
        ))}
      </RadioGroup>
      {type === UserFilterType.FIDS && (
        <SelectIndividualUsersComponent
          field={field}
          setFieldValue={(field, value) => setFidValue(value)}
          setErrorState={setErrorState}
          defaultValue={fidValue || defaultValue}
        />
      )}
    </YStack>
  )
}

const SelectIndividualUsersComponent = ({
  field,
  setFieldValue,
  setErrorState,
  defaultValue,
}: {
  field: FormField<FormComponentSelectUsers>
  setFieldValue: (field: string, value: any) => void
  setErrorState: (field: string, error: boolean) => void
  defaultValue?: UserFilter
}) => {
  const { openSheet } = useSheets()
  const [users, setUsers] = useState<FarcasterUser[]>([])

  useQuery({
    queryKey: ['usersComponent', field.component.type, JSON.stringify(defaultValue)],
    queryFn: async () => {
      if (!defaultValue) return
      if (defaultValue.type !== UserFilterType.FIDS) return
      const data = await fetchUsers(defaultValue.data.fids)
      if (data) {
        setUsers(data.data)
      }
      return data
    },
    enabled: !!defaultValue,
  })

  const handleChange = (users: FarcasterUser[]) => {
    if (users.length === 0) {
      setFieldValue(field.field, undefined)
      return
    }
    setFieldValue(field.field, {
      type: UserFilterType.FIDS,
      data: { fids: users.map((c) => c.fid) },
    })
    setUsers(users)
  }

  return (
    <TouchableOpacity
      onPress={() =>
        openSheet(SheetType.UserSelector, {
          limit: field.component.limit,
          users,
          onChange: handleChange,
        })
      }
    >
      <XStack
        borderRadius="$4"
        borderColor="$color6"
        borderWidth="$0.25"
        backgroundColor="$color3"
        paddingHorizontal="$2"
        paddingVertical="$2"
        minHeight="$4"
        alignItems="center"
      >
        {users.length === 0 ? (
          <Text color="$color9" paddingLeft="$2">
            Select users...
          </Text>
        ) : (
          <XStack gap="$2" flexWrap="wrap">
            {users.map((user) => (
              <XStack
                key={user.fid}
                height="$2.5"
                paddingHorizontal="$2.5"
                alignItems="center"
                backgroundColor="$color2"
                borderRadius="$6"
                gap="$2"
              >
                <View borderRadius="$10" overflow="hidden">
                  {user.pfp && (
                    <Image source={{ uri: user.pfp }} style={{ width: 16, height: 16 }} />
                  )}
                </View>
                <Text color="$mauve12">{user.username}</Text>
              </XStack>
            ))}
          </XStack>
        )}
      </XStack>
    </TouchableOpacity>
  )
}

const SelectChannelsComponent = ({
  field,
  setFieldValue,
  setErrorState,
  defaultValue,
}: {
  field: FormField<FormComponentSelectChannels>
  setFieldValue: (field: string, value: any) => void
  setErrorState: (field: string, error: boolean) => void
  defaultValue?: ChannelFilter
}) => {
  const { openSheet } = useSheets()
  const [channels, setChannels] = useState<Channel[]>([])

  useQuery({
    queryKey: ['channelsComponent', field.component.type, JSON.stringify(defaultValue)],
    queryFn: async () => {
      if (!defaultValue) return
      if (defaultValue.type !== ChannelFilterType.CHANNEL_URLS) return
      const data = await fetchChannels(defaultValue.data.urls)
      if (data) {
        setChannels(data.data)
      }
      return data
    },
    enabled: !!defaultValue,
  })

  const handleChange = (channels: Channel[]) => {
    if (channels.length === 0) {
      setFieldValue(field.field, undefined)
      return
    }
    setFieldValue(field.field, {
      type: ChannelFilterType.CHANNEL_URLS,
      data: { urls: channels.map((c) => c.url) },
    })
    setChannels(channels)
  }

  return (
    <TouchableOpacity
      onPress={() =>
        openSheet(SheetType.ChannelSelector, {
          limit: field.component.limit,
          channels,
          onChange: handleChange,
        })
      }
    >
      <XStack
        borderRadius="$4"
        borderColor="$color6"
        borderWidth="$0.25"
        backgroundColor="$color3"
        paddingHorizontal="$2"
        paddingVertical="$2"
        minHeight="$4"
        alignItems="center"
      >
        {channels.length === 0 ? (
          <Text color="$color9" paddingLeft="$2">
            Select channels...
          </Text>
        ) : (
          <XStack gap="$2" flexWrap="wrap">
            {channels.map((channel) => (
              <XStack
                key={channel.channelId}
                height="$2.5"
                paddingHorizontal="$2.5"
                alignItems="center"
                backgroundColor="$color2"
                borderRadius="$6"
                gap="$2"
              >
                <View borderRadius="$10" overflow="hidden">
                  {channel.imageUrl && (
                    <Image
                      source={{ uri: channel.imageUrl }}
                      style={{ width: 16, height: 16 }}
                    />
                  )}
                </View>
                <Text color="$mauve12">{channel.name}</Text>
              </XStack>
            ))}
          </XStack>
        )}
      </XStack>
    </TouchableOpacity>
  )
}

const InputComponent = ({
  field,
  setFieldValue,
  setErrorState,
  defaultValue,
}: {
  field: FormField<FormComponentInput>
  setFieldValue: (field: string, value: any) => void
  setErrorState: (field: string, error: boolean) => void
  defaultValue?: string
}) => {
  const [value, setValue] = useState<string>(
    defaultValue || (field.component.defaultValue ?? '')
  )
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    setFieldValue(field.field, value.length > 0 ? value : undefined)

    let error: string | undefined
    if (value && field.component.minLength && value.length < field.component.minLength) {
      error = `Minimum length is ${field.component.minLength}`
    }
    if (value && field.component.maxLength && value.length > field.component.maxLength) {
      error = `Maximum length is ${field.component.maxLength}`
    }

    setError(error)
    setErrorState(field.field, !!error)
  }, [value])

  return (
    <>
      <Input
        placeholder={field.component.placeholder || 'Enter text...'}
        value={value}
        onChangeText={setValue}
      />
      {error && <Text color="$red9">{error}</Text>}
    </>
  )
}

const SwitchComponent = ({
  field,
  setFieldValue,
  setErrorState,
  defaultValue,
}: {
  field: FormField<FormComponentSwitch>
  setFieldValue: (field: string, value: any) => void
  setErrorState: (field: string, error: boolean) => void
  defaultValue?: boolean
}) => {
  const [value, setValue] = useState<boolean>(
    defaultValue || (field.component.defaultValue ?? false)
  )

  useEffect(() => {
    setFieldValue(field.field, value || undefined)
  }, [value])

  return (
    <View paddingHorizontal="$1">
      <Switch onCheckedChange={setValue} size="$3">
        <Switch.Thumb animation="quick" backgroundColor={value ? 'white' : '$color6'} />
      </Switch>
    </View>
  )
}

const MultiInputComponent = ({
  field,
  setFieldValue,
  setErrorState,
  defaultValue,
}: {
  field: FormField<FormComponentMultiInput>
  setFieldValue: (field: string, value: any) => void
  setErrorState: (field: string, error: boolean) => void
  defaultValue?: string[]
}) => {
  const [values, setValues] = useState<string[]>(defaultValue || [])
  const [value, setValue] = useState<string>('')
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    const newValues = [...values, value].filter((v) => v.length > 0)
    setFieldValue(field.field, newValues.length > 0 ? newValues : undefined)

    let error: string | undefined
    if (value && field.component.minLength && value.length < field.component.minLength) {
      error = `Minimum length is ${field.component.minLength}`
    }
    if (value && field.component.maxLength && value.length > field.component.maxLength) {
      error = `Maximum length is ${field.component.maxLength}`
    }

    setError(error)
    setErrorState(field.field, !!error)
  }, [value])

  const handleAddValue = () => {
    setValues((prev) => [...prev, value])
    setValue('')
  }

  const handleRemoveValue = (index: number) => {
    const newValues = values.filter((_, i) => i !== index)
    setFieldValue(field.field, newValues.length > 0 ? newValues : undefined)
    setValues((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <>
      <YStack gap="$1.5">
        {values.map((value, index) => (
          <XStack
            key={index}
            justifyContent="space-between"
            borderRadius="$4"
            borderColor="$color6"
            borderWidth="$0.25"
            backgroundColor="$color3"
            paddingHorizontal="$3.5"
            paddingVertical="$2"
            minHeight="$4"
            alignItems="center"
          >
            <Text color="$mauve12">{value}</Text>
            <Button
              onPress={() => handleRemoveValue(index)}
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
          </XStack>
        ))}
        <Input
          placeholder={field.component.placeholder || 'Enter text...'}
          value={value}
          onChangeText={setValue}
        />
        <Button onPress={handleAddValue} disabled={value.length === 0}>
          <Text
            textTransform="uppercase"
            color={value.length > 0 ? '$mauve12' : '$mauve9'}
            fontSize="$1"
            fontWeight="600"
            letterSpacing={0.5}
          >
            Add
            {field.component.limit
              ? ` (${values.length + (value.length > 0 ? 1 : 0)}/${
                  field.component.limit
                })`
              : ''}
          </Text>
        </Button>
      </YStack>
      {error && <Text color="$red9">{error}</Text>}
    </>
  )
}

const SelectOptionComponent = ({
  field,
  setFieldValue,
  setErrorState,
  defaultValue,
}: {
  field: FormField<FormComponentSelect>
  setFieldValue: (field: string, value: any) => void
  setErrorState: (field: string, error: boolean) => void
  defaultValue?: string
}) => {
  const { openSheet } = useSheets()
  const [value, setValue] = useState<string>(
    defaultValue || field.component.options[0].value
  )

  useEffect(() => {
    setFieldValue(field.field, value)
  }, [value])

  return (
    <View marginHorizontal="$2">
      <TouchableOpacity
        onPress={() =>
          openSheet(SheetType.OptionSelector, {
            options: field.component.options,
            value,
            onSelect: (option) => setValue(option),
          })
        }
      >
        <XStack
          height="$4"
          paddingHorizontal="$3"
          alignItems="center"
          borderColor="$color5"
          borderWidth="$0.25"
          borderRadius="$4"
          justifyContent="space-between"
        >
          <Text color="$mauve12">
            {field.component.options.find((o) => o.value === value)?.label || value}
          </Text>
          <ChevronDown size={16} color="$mauve12" />
        </XStack>
      </TouchableOpacity>
    </View>
  )
}

const UrlComponent = ({
  field,
  setFieldValue,
  setErrorState,
  defaultValue,
}: {
  field: FormField<FormComponentUrl>
  setFieldValue: (field: string, value: any) => void
  setErrorState: (field: string, error: boolean) => void
  defaultValue?: string
}) => {
  const [value, setValue] = useState<string>(
    defaultValue || (field.component.defaultValue ?? '')
  )
  const [error, setError] = useState<string | undefined>()
  const [loading, setLoading] = useState<boolean>(false)

  const debouncedValue = useDebounceValue(value, 1000)

  const handleUrlChange = async (url: string) => {
    setLoading(true)
    const formattedUrl = !url.startsWith('http') ? `https://${url}` : url
    const content = await fetchContent(formattedUrl)
    if (!content) {
      setFieldValue(field.field, undefined)
      setError('Invalid url')
      setErrorState(field.field, true)
      setLoading(false)
      return
    }

    if (field.component.hasFrame && !content.hasFrame) {
      setFieldValue(field.field, undefined)
      setError('Invalid frame')
      setErrorState(field.field, true)
      setLoading(false)
      return
    }

    setFieldValue(field.field, formattedUrl)
    setError(undefined)
    setErrorState(field.field, false)
    setLoading(false)
  }

  useEffect(() => {
    if (!debouncedValue) return
    handleUrlChange(debouncedValue)
  }, [debouncedValue])

  return (
    <>
      <Input
        placeholder={field.component.placeholder || 'Enter url...'}
        value={value}
        onChangeText={setValue}
      />
      {loading && (
        <XStack gap="$1" alignItems="center">
          <Spinner />
          <Label>Validating URL</Label>
        </XStack>
      )}
      {error && !loading && <Text color="$red9">{error}</Text>}
    </>
  )
}
