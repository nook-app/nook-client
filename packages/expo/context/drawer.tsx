import { createContext, useContext, ReactNode, useState, useCallback } from 'react'

type DrawerContextType = {
  open: boolean
  onOpen: () => void
  onClose: () => void
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined)

type SheetProviderProps = {
  children: ReactNode
}

export const DrawerProvider = ({ children }: SheetProviderProps) => {
  const [open, setOpen] = useState(false)

  const onOpen = useCallback(() => setOpen(true), [])
  const onClose = useCallback(() => setOpen(false), [])

  return (
    <DrawerContext.Provider
      value={{
        open,
        onOpen,
        onClose,
      }}
    >
      {children}
    </DrawerContext.Provider>
  )
}

export const useDrawer = () => {
  const context = useContext(DrawerContext)
  if (context === undefined) {
    throw new Error('useDrawer must be used within a DrawerProvider')
  }
  return context
}
