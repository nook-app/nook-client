import { ChannelFilterType, UserFilterType } from './feed'

export type Form = {
  steps: FormStep[]
}

export type FormStep = {
  fields: FormField[]
}

export type FormField<T = FormComponent> = {
  name: string
  description?: string
  field: string
  component: T
  required?: boolean
}

export type FormComponent =
  | FormComponentSelectUsers
  | FormComponentSelectChannels
  | FormComponentInput
  | FormComponentMultiInput
  | FormComponentSwitch
  | FormComponentSelect
  | FormComponentIconPicker
  | FormComponentMultiUrl
  | FormComponentUrl

export type FormComponentSelectUsers = {
  type: FormComponentType.SELECT_USERS
  allowed: UserFilterType[]
  limit?: number
}

export type FormComponentSelectChannels = {
  type: FormComponentType.SELECT_CHANNELS
  allowed: ChannelFilterType[]
  limit?: number
}

export type FormComponentInput = {
  type: FormComponentType.INPUT
  minLength?: number
  maxLength?: number
  placeholder?: string
  defaultValue?: string
}

export type FormComponentMultiInput = {
  type: FormComponentType.MULTI_INPUT
  minLength?: number
  maxLength?: number
  placeholder?: string
  limit?: number
}

export type FormComponentSwitch = {
  type: FormComponentType.SWITCH
  defaultValue?: boolean
}

export type FormComponentSelect = {
  type: FormComponentType.SELECT_OPTION
  options: {
    value: string
    label: string
  }[]
}

export type FormComponentIconPicker = {
  type: FormComponentType.ICON_PICKER
}

export type FormComponentMultiUrl = {
  type: FormComponentType.MULTI_URL
  placeholder?: string
  defaultValue?: string
  hasFrame?: boolean
}

export type FormComponentUrl = {
  type: FormComponentType.URL
  placeholder?: string
  defaultValue?: string
  hasFrame?: boolean
}

export enum FormComponentType {
  SELECT_OPTION = 'SELECT_OPTION',
  SELECT_USERS = 'SELECT_USERS',
  SELECT_CHANNELS = 'SELECT_CHANNELS',
  INPUT = 'INPUT',
  MULTI_INPUT = 'MULTI_INPUT',
  SWITCH = 'SWITCH',
  ICON_PICKER = 'ICON_PICKER',
  URL = 'URL',
  MULTI_URL = 'MULTI_URL',
}
