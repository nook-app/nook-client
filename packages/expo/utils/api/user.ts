import { FarcasterUser, GetSignerResponse, ValidateSignerResponse } from '@/types'
import { FetchUsersResponse, makeRequestJson } from './util'

export const getSigner = async (): Promise<GetSignerResponse> => {
  return await makeRequestJson('/signer')
}

export const getUser = async () => {
  return await makeRequestJson('/user')
}

export const validateSigner = async (token: string): Promise<ValidateSignerResponse> => {
  return await makeRequestJson(`/signer/validate?token=${token}`)
}

export const fetchUser = async (fid: string): Promise<FarcasterUser> => {
  return await makeRequestJson(`/farcaster/users/${fid}`)
}

export const fetchUserFollowers = async (
  fid: string,
  cursor?: string
): Promise<FetchUsersResponse> => {
  return await makeRequestJson(
    `/farcaster/users/${fid}/followers${cursor ? `?cursor=${cursor}` : ''}`
  )
}

export const fetchUserFollowing = async (
  fid: string,
  cursor?: string
): Promise<FetchUsersResponse> => {
  return await makeRequestJson(
    `/farcaster/users/${fid}/following${cursor ? `?cursor=${cursor}` : ''}`
  )
}

export const searchUsers = async (
  query: string,
  cursor?: string,
  limit?: number
): Promise<FetchUsersResponse> => {
  return await makeRequestJson(
    `/farcaster/users?query=${query}${cursor ? `&cursor=${cursor}` : ''}${
      limit ? `&limit=${limit}` : ''
    }`
  )
}

export const fetchUsers = async (fids: string[]): Promise<FetchUsersResponse> => {
  return await makeRequestJson('/farcaster/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fids }),
  })
}

export const updateEnableDegenTip = async (enableDegenTip: boolean) => {
  return await makeRequestJson('/user/metadata', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ enableDegenTip }),
  })
}

export const updateOrder = async (order: [string, string[]][]) => {
  return await makeRequestJson('/user/metadata', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ order }),
  })
}

export const updateColorSchemeOverride = async (colorSchemeOverride: string | null) => {
  return await makeRequestJson('/user/metadata', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ colorSchemeOverride }),
  })
}

export const muteUser = async (mutedFid: string) => {
  return await makeRequestJson(`/mute/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mutedFid }),
  })
}

export const unmuteUser = async (mutedFid: string) => {
  return await makeRequestJson(`/mute/users`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mutedFid }),
  })
}

export const muteChannel = async (mutedParentUrl: string) => {
  return await makeRequestJson(`/mute/channels`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mutedParentUrl }),
  })
}

export const unmuteChannel = async (mutedParentUrl: string) => {
  return await makeRequestJson(`/mute/channels`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mutedParentUrl }),
  })
}

export const muteWord = async (mutedWord: string) => {
  return await makeRequestJson(`/mute/words`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mutedWord }),
  })
}

export const unmuteWord = async (mutedWord: string) => {
  return await makeRequestJson(`/mute/words`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mutedWord }),
  })
}
