import {
  SignInParams,
  SubmitCastAddRequest,
  SubmitCastRemoveRequest,
  SubmitReactionAddRequest,
  SubmitReactionRemoveRequest,
  SubmitLinkAddRequest,
  SubmitLinkRemoveRequest,
  SubmitFrameActionRequest,
  SubmitFrameActionResponse,
  SubmitMessageResponse,
  SubmitMessageError,
  ImgurUploadResponse,
  SignInDevParams,
  CastActionRequest,
} from '@/types'
import { makeRequestJson } from './util'
import { Session } from '../session'

export const getUserData = async (): Promise<{
  theme: string
}> => {
  return await makeRequestJson('/user')
}

export const setUserData = async (data: {
  theme: string
}): Promise<{
  theme: string
}> => {
  return await makeRequestJson('/user', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export const loginUser = async (params: SignInParams): Promise<Session> => {
  return await makeRequestJson('/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })
}

export const loginUserDev = async (params: SignInDevParams): Promise<Session> => {
  return await makeRequestJson('/user/login/dev', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })
}

export const loginUserPrivy = async (token: string): Promise<Session> => {
  return await makeRequestJson('/user/login/privy', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export const refreshUser = async (session: Session): Promise<Session> => {
  return await makeRequestJson('/user/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(session),
  })
}

export const submitFrameAction = async (
  req: SubmitFrameActionRequest
): Promise<SubmitFrameActionResponse | SubmitMessageError> => {
  return await makeRequestJson('/frames/action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })
}

export const submitCastAdds = async (
  req: SubmitCastAddRequest[]
): Promise<SubmitMessageResponse | SubmitMessageError> => {
  if (req.length === 1) {
    return await submitCastAdd(req[0])
  }

  return await makeRequestJson('/signer/cast-add/thread', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: req }),
  })
}

export const submitCastAdd = async (
  req: SubmitCastAddRequest
): Promise<SubmitMessageResponse | SubmitMessageError> => {
  return await makeRequestJson('/signer/cast-add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })
}

export const submitCastRemove = async (
  req: SubmitCastRemoveRequest
): Promise<SubmitMessageResponse | SubmitMessageError> => {
  return await makeRequestJson('/signer/cast-remove', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })
}

export const submitReactionAdd = async (
  req: SubmitReactionAddRequest
): Promise<SubmitMessageResponse | SubmitMessageError> => {
  return await makeRequestJson('/signer/reaction-add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })
}

export const submitReactionRemove = async (
  req: SubmitReactionRemoveRequest
): Promise<SubmitMessageResponse | SubmitMessageError> => {
  return await makeRequestJson('/signer/reaction-remove', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })
}

export const submitLinkAdd = async (
  req: SubmitLinkAddRequest
): Promise<SubmitMessageResponse | SubmitMessageError> => {
  return await makeRequestJson('/signer/link-add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })
}

export const submitLinkRemove = async (
  req: SubmitLinkRemoveRequest
): Promise<SubmitMessageResponse | SubmitMessageError> => {
  return await makeRequestJson('/signer/link-remove', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })
}

export const uploadImage = async (image: string): Promise<ImgurUploadResponse> => {
  const response = await fetch('https://imgur-apiv3.p.rapidapi.com/3/image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Client-ID c2593243d3ea679',
      'X-RapidApi-Key': 'H6XlGK0RRnmshCkkElumAWvWjiBLp1ItTOBjsncst1BaYKMS8H',
    },
    body: JSON.stringify({ image }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error(error)
    throw new Error(error)
  }

  return await response.json()
}

export const updateAction = async (index: number, action: CastActionRequest | null) => {
  await makeRequestJson('/user/actions', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ index, action }),
  })
}

export const updateActionV2 = async (index: number, url: string) => {
  await makeRequestJson('/user/actions', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ index, action: { url } }),
  })
}

export const searchActions = async (query: string, cursor?: string) => {
  return await makeRequestJson(
    `/actions?query=${query}${cursor ? `&cursor=${cursor}` : ''}`
  )
}

export const getUserActions = async () => {
  return await makeRequestJson('/user/actions')
}
