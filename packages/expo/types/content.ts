import { Frame } from './frames'

export type Metadata = {
  audio?: string
  author?: string
  date?: string
  description?: string
  image?: string
  lang?: string
  logo?: string
  publisher?: string
  title?: string
  url?: string
  video?: string
  [key: string]: string | undefined
}

export type UrlContentResponse = {
  uri: string
  protocol?: string
  host?: string
  path?: string
  query?: string
  fragment?: string
  type?: string
  length?: number
  metadata?: Metadata
  frame?: Frame
  hasFrame?: boolean
}

export enum ContentReferenceType {
  Embed = 'EMBED',
  Reply = 'REPLY',
  Quote = 'QUOTE',
}

export type ContentReference = {
  fid: bigint
  hash: string
  uri: string
  type: ContentReferenceType
  timestamp: Date
}
