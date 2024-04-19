import { ChannelList, UserList } from '@/types/lists'
import { makeRequestJson } from './util'

export const fetchFlags = async (): Promise<{ reviewMode?: boolean }> => {
  return await makeRequestJson(`/flags`)
}
