import { Channel, FarcasterUser } from '@/types'
import { TransactionTargetResponse } from '@/types/frames'
import { haptics } from '@/utils/haptics'
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { Href } from 'expo-router/build/link/href'
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useRef,
  RefObject,
  useEffect,
  useCallback,
} from 'react'

export enum SheetType {
  EnableSigner = 'enableSigner',
  CastAction = 'castAction',
  UserAction = 'userAction',
  ChannelAction = 'channelAction',
  ChannelSelector = 'channelSelector',
  UserSelector = 'userSelector',
  SwitchAccount = 'switchAccount',
  OptionSelector = 'optionSelector',
  DegenTip = 'degenTip',
  FrameTransaction = 'frameTransaction',
  RecastAction = 'recastAction',
  BrowseActions = 'browseActions',
  AddAction = 'addAction',
  FeedAction = 'feedAction',
  NookAction = 'nookAction',
  Info = 'info',
  FeedInfo = 'feedInfo',
}

export type InitialStateArgs = {
  [SheetType.EnableSigner]: undefined
  [SheetType.CastAction]: {
    hash: string
  }
  [SheetType.UserAction]: {
    fid: string
  }
  [SheetType.ChannelAction]: {
    channelId: string
  }
  [SheetType.ChannelSelector]: {
    channels: Channel[]
    onChange?: (channels: Channel[]) => void
    onSelectChannel?: (channel?: Channel) => void
    onUnselectChannel?: (channel?: Channel) => void
    showRecommended?: boolean
    limit?: number
  }
  [SheetType.UserSelector]: {
    users: FarcasterUser[]
    onChange?: (users: FarcasterUser[]) => void
    onSelectUser?: (user?: FarcasterUser) => void
    onUnselectUser?: (user?: FarcasterUser) => void
    limit?: number
  }
  [SheetType.SwitchAccount]: undefined
  [SheetType.OptionSelector]: {
    value?: string
    options: {
      label: (active: boolean) => ReactNode
      value: string
    }[]
    onSelect: (option: string) => void
  }
  [SheetType.DegenTip]: {
    hash: string
  }
  [SheetType.FrameTransaction]: {
    host: string
    data: TransactionTargetResponse
    onSuccess: (hash: string) => void
  }
  [SheetType.RecastAction]: {
    hash: string
  }
  [SheetType.BrowseActions]: {
    index?: number | null
  }
  [SheetType.AddAction]: {
    index: number
  }
  [SheetType.Info]: {
    title: string
    description: string
    route?: Href
    buttonText?: string
  }
  [SheetType.FeedAction]: {
    feedId: string
  }
  [SheetType.NookAction]: {
    nookId: string
  }
  [SheetType.FeedInfo]: {
    feedId: string
  }
}

export type SheetState<T extends keyof InitialStateArgs = SheetType> = {
  type: SheetType
  snapPoints?: string[]
  isOpen: boolean
  initialState?: InitialStateArgs[T]
  autoHeight?: boolean
  fullscreen?: boolean
}

type SheetContextType = {
  openSheet: (type: SheetType, initialState?: InitialStateArgs[SheetType]) => void
  closeSheet: (type: SheetType) => void
  closeAllSheets: () => void
  sheets: Record<SheetType, SheetState>
}

const SheetContext = createContext<SheetContextType | undefined>(undefined)

type SheetProviderProps = {
  children: ReactNode
}

export const SheetProvider = ({ children }: SheetProviderProps) => {
  const [sheets, setSheets] = useState<Record<SheetType, SheetState>>({
    [SheetType.EnableSigner]: {
      type: SheetType.EnableSigner,
      isOpen: false,
      initialState: undefined,
      autoHeight: true,
    },
    [SheetType.CastAction]: {
      type: SheetType.CastAction,
      isOpen: false,
      initialState: undefined,
      autoHeight: true,
    },
    [SheetType.ChannelSelector]: {
      type: SheetType.ChannelSelector,
      isOpen: false,
      initialState: undefined,
      snapPoints: ['90%'],
    },
    [SheetType.UserSelector]: {
      type: SheetType.UserSelector,
      isOpen: false,
      initialState: undefined,
      snapPoints: ['90%'],
    },
    [SheetType.SwitchAccount]: {
      type: SheetType.SwitchAccount,
      isOpen: false,
      initialState: undefined,
      autoHeight: true,
    },
    [SheetType.OptionSelector]: {
      type: SheetType.OptionSelector,
      isOpen: false,
      initialState: undefined,
      autoHeight: true,
    },
    [SheetType.DegenTip]: {
      type: SheetType.DegenTip,
      isOpen: false,
      initialState: undefined,
      autoHeight: true,
    },
    [SheetType.FrameTransaction]: {
      type: SheetType.FrameTransaction,
      isOpen: false,
      initialState: undefined,
      autoHeight: true,
    },
    [SheetType.RecastAction]: {
      type: SheetType.RecastAction,
      isOpen: false,
      initialState: undefined,
      autoHeight: true,
    },
    [SheetType.BrowseActions]: {
      type: SheetType.BrowseActions,
      isOpen: false,
      initialState: undefined,
      snapPoints: ['90%'],
    },
    [SheetType.AddAction]: {
      type: SheetType.AddAction,
      isOpen: false,
      initialState: undefined,
      snapPoints: ['90%'],
    },
    [SheetType.Info]: {
      type: SheetType.Info,
      isOpen: false,
      initialState: undefined,
      autoHeight: true,
    },
    [SheetType.UserAction]: {
      type: SheetType.UserAction,
      isOpen: false,
      initialState: undefined,
      autoHeight: true,
    },
    [SheetType.ChannelAction]: {
      type: SheetType.ChannelAction,
      isOpen: false,
      initialState: undefined,
      autoHeight: true,
    },
    [SheetType.FeedAction]: {
      type: SheetType.FeedAction,
      isOpen: false,
      initialState: undefined,
      autoHeight: true,
    },
    [SheetType.NookAction]: {
      type: SheetType.NookAction,
      isOpen: false,
      initialState: undefined,
      autoHeight: true,
    },
    [SheetType.FeedInfo]: {
      type: SheetType.FeedInfo,
      isOpen: false,
      initialState: undefined,
      autoHeight: true,
    },
  })

  const openSheet = useCallback(
    (type: SheetType, initialState?: InitialStateArgs[SheetType]) => {
      setSheets((prevSheets) => {
        const currentSheet = prevSheets[type]
        const updatedSheet = { ...currentSheet, isOpen: true, initialState }
        const updatedSheets = { ...prevSheets, [type]: updatedSheet }
        return updatedSheets
      })
      haptics.impactLight()
    },
    []
  )

  const closeSheet = useCallback((type: SheetType) => {
    setSheets((prevSheets) => {
      const currentSheet = prevSheets[type]
      const updatedSheet = { ...currentSheet, isOpen: false }
      return { ...prevSheets, [type]: updatedSheet }
    })
  }, [])

  const closeAllSheets = useCallback(() => {
    setSheets((prevSheets) => {
      const updatedSheets = Object.entries(prevSheets).reduce(
        (acc, [key, sheet]) => {
          acc[key as SheetType] = { ...sheet, isOpen: false }
          return acc
        },
        {} as Record<SheetType, SheetState>
      )
      return updatedSheets
    })
  }, [])

  return (
    <BottomSheetModalProvider>
      <SheetContext.Provider
        value={{
          openSheet,
          closeSheet,
          closeAllSheets,
          sheets,
        }}
      >
        {children}
      </SheetContext.Provider>
    </BottomSheetModalProvider>
  )
}

export const useSheets = () => {
  const context = useContext(SheetContext)
  if (context === undefined) {
    throw new Error('useSheet must be used within a SheetProvider')
  }
  return context
}

export const useSheet = <T extends SheetType>(type: T) => {
  const { sheets, openSheet, closeSheet, closeAllSheets } = useSheets()

  return { sheet: sheets[type] as SheetState<T>, openSheet, closeSheet, closeAllSheets }
}
