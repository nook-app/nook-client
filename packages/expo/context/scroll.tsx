import { createContext, useContext, ReactNode, useState } from 'react'

type ScrollContextType = {
  activeVideo: string
  setActiveVideo: (active: string) => void
  showNotificationsOverlay: boolean
  setShowNotificationsOverlay: (showOverlay: boolean) => void
  showNookOverlay: boolean
  setShowNookOverlay: (showOverlay: boolean) => void
  showFeedOverlay: boolean
  setShowFeedOverlay: (showOverlay: boolean) => void
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined)

type SheetProviderProps = {
  children: ReactNode
}

export const ScrollProvider = ({ children }: SheetProviderProps) => {
  const [activeVideo, setActiveVideo] = useState('')
  const [showNookOverlay, setShowNookOverlay] = useState(true)
  const [showFeedOverlay, setShowFeedOverlay] = useState(true)
  const [showNotificationsOverlay, setShowNotificationsOverlay] = useState(true)

  return (
    <ScrollContext.Provider
      value={{
        activeVideo,
        setActiveVideo,
        showNotificationsOverlay,
        setShowNotificationsOverlay,
        showNookOverlay,
        setShowNookOverlay,
        showFeedOverlay,
        setShowFeedOverlay,
      }}
    >
      {children}
    </ScrollContext.Provider>
  )
}

export const useScroll = () => {
  const context = useContext(ScrollContext)
  if (context === undefined) {
    throw new Error('useScroll must be used within a ScrollProvider')
  }
  return context
}
