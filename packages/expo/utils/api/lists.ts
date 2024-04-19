import { ChannelList, UserList } from '@/types/lists'
import { makeRequestJson } from './util'

export const createUserList = async (userList: UserList) => {
  return await makeRequestJson('/lists/users', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userList),
  })
}

export const updateUserList = async (userList: UserList) => {
  return await makeRequestJson(`/lists/users/${userList.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userList),
  })
}

export const fetchUserList = async (userListId: string): Promise<UserList> => {
  return await makeRequestJson(`/lists/users/${userListId}`)
}

export const fetchUserLists = async (fid: string): Promise<UserList[]> => {
  return await makeRequestJson(`/lists/users?fid=${fid}`)
}

export const deleteUserList = async (userListId: string) => {
  return await makeRequestJson(`/lists/users/${userListId}`, {
    method: 'DELETE',
  })
}

export const createChannelList = async (channelList: ChannelList) => {
  return await makeRequestJson('/lists/channels', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(channelList),
  })
}

export const updateChannelList = async (channelList: ChannelList) => {
  return await makeRequestJson(`/lists/channels/${channelList.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(channelList),
  })
}

export const fetchChannelList = async (channelListId: string): Promise<ChannelList> => {
  return await makeRequestJson(`/lists/channels/${channelListId}`)
}

export const fetchChannelLists = async (fid: string): Promise<ChannelList[]> => {
  return await makeRequestJson(`/lists/channels?fid=${fid}`)
}

export const deleteChannelList = async (channelListId: string) => {
  return await makeRequestJson(`/lists/channels/${channelListId}`, {
    method: 'DELETE',
  })
}
