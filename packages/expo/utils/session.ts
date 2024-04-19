import * as SecureStore from 'expo-secure-store'
import { CONFIG } from '@/constants'

export type Session = {
  fid: string
  token: string
  refreshToken: string
  expiresAt: number
  theme?: string
}

const SESSION_KEY = 'session'
const SESSIONS_KEY = 'sessions'
const ONE_DAY = 24 * 60 * 60

export const getSessions = async () => {
  const sessionsJson = await SecureStore.getItemAsync(SESSIONS_KEY)
  try {
    return sessionsJson ? JSON.parse(sessionsJson) : []
  } catch (e) {
    console.error(e)
    return []
  }
}

export const removeSession = async (session: Session) => {
  const sessions = await getSessions()
  const remainingSessions = sessions.filter((s: Session) => s.fid !== session.fid)
  await SecureStore.setItemAsync(SESSIONS_KEY, JSON.stringify(remainingSessions))
  return remainingSessions
}

export const getSession = async () => {
  const sessionJson = await SecureStore.getItemAsync(SESSION_KEY)
  if (sessionJson) {
    const session = JSON.parse(sessionJson) as Session
    if (session.expiresAt - Math.floor(Date.now() / 1000) < ONE_DAY) {
      return await refreshSession(session)
    }
    return session
  }
}

export const updateSession = async (session: Session) => {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session))

  const sessions = await getSessions()
  if (sessions.some((s: Session) => s.fid === session.fid)) {
    const updatedSessions = sessions.map((s: Session) =>
      s.fid === session.fid ? session : s
    )
    await SecureStore.setItemAsync(SESSIONS_KEY, JSON.stringify(updatedSessions))
  } else {
    await SecureStore.setItemAsync(SESSIONS_KEY, JSON.stringify([...sessions, session]))
  }

  return session
}

export const deleteSession = async () => {
  await SecureStore.deleteItemAsync(SESSION_KEY)
}

export const refreshSession = async (existingSession?: Session) => {
  const session = existingSession || (await getSession())
  if (!session) return

  try {
    const newSession = {
      ...session,
      ...(await refreshToken(session)),
    } as Session
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(newSession))
    return newSession
  } catch (e) {
    console.error(e)
  }
}

export const refreshToken = async (session: Session) => {
  const response = await fetch(`${CONFIG.apiBaseUrl}/user/token`, {
    headers: {
      Authorization: `Bearer ${session.refreshToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return (await response.json()) as Session
}
