import { UrlContentResponse } from '@/types'
import { makeRequest } from './util'

export const fetchContent = async (
  uri: string
): Promise<UrlContentResponse | undefined> => {
  const response = await makeRequest('/content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uri }),
  })

  if (response.status === 404) {
    return
  }

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return await response.json()
}
