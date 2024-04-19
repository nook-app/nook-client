import { CastActionRequest, FarcasterCast } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { createContext, useContext, ReactNode, useState } from 'react'
import { useAuth } from './auth'
import {
  getUserActions,
  submitFrameAction,
  updateAction,
  updateActionV2,
} from '@/utils/api'
import { useToastController } from '@tamagui/toast'

type ActionsContextType = {
  actions: (CastActionRequest | null)[]
  executeAction: (action: CastActionRequest, cast: FarcasterCast) => Promise<void>
  updateAction: (
    index: number,
    action: CastActionRequest | null,
    v2?: boolean
  ) => Promise<void>
  lastAction: CastActionRequest | null
}

const ActionsContext = createContext<ActionsContextType | undefined>(undefined)

type SheetProviderProps = {
  children: ReactNode
}

export const ActionsProvider = ({ children }: SheetProviderProps) => {
  const { session } = useAuth()
  const [lastAction, setLastAction] = useState<CastActionRequest | null>(null)
  const [actions, setActions] = useState<(CastActionRequest | null)[]>([])
  const toast = useToastController()

  useQuery({
    queryKey: ['actions', session?.fid],
    queryFn: async () => {
      const data = await getUserActions()
      if (data) {
        setActions(data.data)
      }
      return data
    },
    enabled: !!session?.fid,
  })

  const executeAction = async (action: CastActionRequest, cast: FarcasterCast) => {
    try {
      const response = await submitFrameAction({
        url: action.postUrl,
        postUrl: action.postUrl,
        castFid: cast.user.fid,
        castHash: cast.hash,
        buttonIndex: 1,
      })
      if ('message' in response) {
        toast.show(response.message)
      }
    } catch (e) {
      toast.show('Error executing action')
    }
    setLastAction(action)
  }

  const handleUpdateAction = async (
    index: number,
    action: CastActionRequest | null,
    v2?: boolean
  ) => {
    if (action && v2) {
      await updateActionV2(index, action.postUrl)
    } else {
      await updateAction(index, action)
    }
    setActions((prevActions) => {
      const newActions = [...prevActions]
      newActions[index] = action
      return newActions
    })
    setLastAction(action)
  }

  return (
    <ActionsContext.Provider
      value={{
        actions,
        executeAction,
        updateAction: handleUpdateAction,
        lastAction: lastAction || actions[0],
      }}
    >
      {children}
    </ActionsContext.Provider>
  )
}

export const useActions = () => {
  const context = useContext(ActionsContext)
  if (context === undefined) {
    throw new Error('useActions must be used within a ActionsProvider')
  }
  return context
}
