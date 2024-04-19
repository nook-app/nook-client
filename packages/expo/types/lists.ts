import { Channel } from './cast'
import { FarcasterUser } from './user'

export type ListMetadata = {
  creatorFid: string
  name: string
  description: string
  imageUrl: string
}

export type UserList = ListMetadata & {
  id: string
  users: FarcasterUser[]
}

export type ChannelList = ListMetadata & {
  id: string
  channels: Channel[]
}
