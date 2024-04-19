import { ChannelFilterType, FormComponentType, FormField, UserFilterType } from '@/types'

const DEFAULT_FEED_FORM_DATA: FormField[] = [
  {
    name: 'Name',
    field: 'name',
    component: {
      type: FormComponentType.INPUT,
      placeholder: 'Enter name...',
      maxLength: 50,
    },
    required: true,
  },
  {
    name: 'Channels',
    field: 'filter.channels',
    component: {
      type: FormComponentType.SELECT_CHANNELS,
      allowed: [ChannelFilterType.CHANNEL_URLS],
      limit: 100,
    },
  },
  {
    name: 'Users',
    field: 'filter.users',
    component: {
      type: FormComponentType.SELECT_USERS,
      allowed: [UserFilterType.POWER_BADGE, UserFilterType.FIDS],
      limit: 100,
    },
  },
  {
    name: 'Search',
    field: 'filter.text',
    component: {
      type: FormComponentType.MULTI_INPUT,
      limit: 10,
      placeholder: 'Search...',
    },
  },
  {
    name: 'Inc Replies',
    field: 'filter.includeReplies',
    component: {
      type: FormComponentType.SWITCH,
      defaultValue: false,
    },
  },
]

const FRAMES_FEED_FORM_DATA: FormField[] = [
  {
    name: 'Name',
    field: 'name',
    component: {
      type: FormComponentType.INPUT,
      placeholder: 'Enter name...',
      maxLength: 50,
    },
    required: true,
  },
  {
    name: 'Channels',
    field: 'filter.channels',
    component: {
      type: FormComponentType.SELECT_CHANNELS,
      allowed: [ChannelFilterType.CHANNEL_URLS],
      limit: 20,
    },
  },
  {
    name: 'Users',
    field: 'filter.users',
    component: {
      type: FormComponentType.SELECT_USERS,
      allowed: [UserFilterType.POWER_BADGE, UserFilterType.FIDS],
      limit: 20,
    },
  },
  {
    name: 'Urls',
    field: 'filter.embeds',
    component: {
      type: FormComponentType.MULTI_INPUT,
      placeholder: 'https://example.com',
      maxLength: 150,
      limit: 10,
    },
  },
  {
    name: 'Inc Replies',
    field: 'filter.includeReplies',
    component: {
      type: FormComponentType.SWITCH,
      defaultValue: false,
    },
  },
]

const MEDIA_FEED_FORM_DATA: FormField[] = [
  {
    name: 'Name',
    field: 'name',
    component: {
      type: FormComponentType.INPUT,
      placeholder: 'Enter name...',
      maxLength: 50,
    },
    required: true,
  },
  {
    name: 'Channels',
    field: 'filter.channels',
    component: {
      type: FormComponentType.SELECT_CHANNELS,
      allowed: [ChannelFilterType.CHANNEL_URLS],
      limit: 20,
    },
  },
  {
    name: 'Users',
    field: 'filter.users',
    component: {
      type: FormComponentType.SELECT_USERS,
      allowed: [UserFilterType.POWER_BADGE, UserFilterType.FIDS],
      limit: 20,
    },
  },
  {
    name: 'Inc Replies',
    field: 'filter.includeReplies',
    component: {
      type: FormComponentType.SWITCH,
      defaultValue: false,
    },
  },
]

const EMBEDS_FEED_FORM_DATA: FormField[] = [
  {
    name: 'Name',
    field: 'name',
    component: {
      type: FormComponentType.INPUT,
      placeholder: 'Enter name...',
      maxLength: 50,
    },
    required: true,
  },
  {
    name: 'Channels',
    field: 'filter.channels',
    component: {
      type: FormComponentType.SELECT_CHANNELS,
      allowed: [ChannelFilterType.CHANNEL_URLS],
      limit: 20,
    },
  },
  {
    name: 'Users',
    field: 'filter.users',
    component: {
      type: FormComponentType.SELECT_USERS,
      allowed: [UserFilterType.POWER_BADGE, UserFilterType.FIDS],
      limit: 20,
    },
  },
  {
    name: 'Urls',
    field: 'filter.embeds',
    component: {
      type: FormComponentType.MULTI_INPUT,
      placeholder: 'https://example.com',
      maxLength: 150,
      limit: 10,
    },
  },
  {
    name: 'Inc Replies',
    field: 'filter.includeReplies',
    component: {
      type: FormComponentType.SWITCH,
      defaultValue: false,
    },
  },
]

export const FORM_FOR_TYPE: { [key: string]: FormField[] } = {
  default: DEFAULT_FEED_FORM_DATA,
  frames: FRAMES_FEED_FORM_DATA,
  media: MEDIA_FEED_FORM_DATA,
  embeds: EMBEDS_FEED_FORM_DATA,
}
