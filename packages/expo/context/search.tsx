import { ChannelFilter, UserFilter } from '@/types'
import { createContext, useContext, ReactNode, useState } from 'react'

type SearchContextType = {
  query: string
  setQuery: (query: string) => void
  users: UserFilter | undefined
  channels: ChannelFilter | undefined
  muteWords: string[] | undefined
  setUsers: (users: UserFilter | undefined) => void
  setChannels: (channels: ChannelFilter | undefined) => void
  setMuteWords: (mutedWords: string[] | undefined) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

type SheetProviderProps = {
  initialQuery: string
  children: ReactNode
}

export const SearchProvider = ({ initialQuery, children }: SheetProviderProps) => {
  const [query, setQuery] = useState(initialQuery)
  const [users, setUsers] = useState<UserFilter | undefined>(undefined)
  const [channels, setChannels] = useState<ChannelFilter | undefined>(undefined)
  const [muteWords, setMuteWords] = useState<string[] | undefined>(undefined)

  return (
    <SearchContext.Provider
      value={{
        query,
        setQuery,
        users,
        setUsers,
        channels,
        setChannels,
        muteWords,
        setMuteWords,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export const useSearch = () => {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}
