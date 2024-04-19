import { Feed, PanelDisplay, User } from '@/types'
import { makeRequestJson } from '@/utils/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { useState, useCallback } from 'react'
import { useDrawer } from '../context/drawer'
import { useAuth } from '../context/auth'
import { useDebouncedNavigate } from './useDebouncedNavigate'

const getExtraFiltersForType = (type: string) => {
  if (type === 'frames') {
    return {
      onlyFrames: true,
    }
  }
  if (type === 'media') {
    return {
      contentTypes: ['image', 'application/x-mpegURL'],
    }
  }
  return {}
}

const getExtraArgsForType = (type: string) => {
  if (type === 'frames') {
    return {
      display: PanelDisplay.FRAMES,
    }
  }
  if (type === 'media') {
    return {
      display: PanelDisplay.MEDIA,
    }
  }
  return {
    display: PanelDisplay.CASTS,
  }
}

export const useCreateFeed = (feed?: Feed) => {
  const [data, setData] = useState<Record<string, any>>(feed || {})
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const queryClient = useQueryClient()
  const { onClose } = useDrawer()
  const { session } = useAuth()
  const { navigate } = useDebouncedNavigate()

  const { mutate, isPending } = useMutation<Feed>({
    mutationFn: () =>
      makeRequestJson('/feeds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          ...getExtraArgsForType(data.type),
          filter: {
            ...data.filter,
            ...getExtraFiltersForType(data.type),
          },
        }),
      }),
    onSuccess: (feedData) => {
      queryClient.setQueryData<Feed>(['feed', feedData.id], feedData)
      queryClient.setQueryData<User>(['authUser', session?.fid], (prev) => {
        if (!prev) return prev
        return {
          ...prev,
          feeds: [...prev.feeds, feedData],
        }
      })
      queryClient.invalidateQueries({ queryKey: ['feedCasts', feedData.id] })
      while (router.canGoBack()) router.back()
      navigate(
        {
          pathname: '/feeds/[feedId]',
          params: { feedId: feedData.id },
        },
        {
          replace: true,
        }
      )
      onClose()
    },
  })

  const { mutate: mutateUpdate, isPending: isPendingUpdate } = useMutation<Feed>({
    mutationFn: () =>
      makeRequestJson(`/feeds/${feed?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          ...getExtraArgsForType(data.type),
          filter: {
            ...data.filter,
            ...getExtraFiltersForType(data.type),
          },
        }),
      }),
    onSuccess: (feedData) => {
      queryClient.setQueryData<Feed>(['feed', feedData.id], feedData)
      queryClient.setQueryData<User>(['authUser', session?.fid], (prev) => {
        if (!prev) return prev
        return {
          ...prev,
          feeds: prev.feeds.map((f) => (f.id === feedData.id ? feedData : f)),
        }
      })
      queryClient.invalidateQueries({ queryKey: ['feedCasts', feedData.id] })
      while (router.canGoBack()) router.back()
      navigate(
        {
          pathname: '/feeds/[feedId]',
          params: { feedId: feedData.id },
        },
        {
          replace: true,
        }
      )
      onClose()
    },
  })

  const setFieldValue = useCallback((key: string, value: any) => {
    const keys = key.split('.')
    setData((prev) => {
      let newData = { ...prev }
      let currentObj = newData
      for (let i = 0; i < keys.length - 1; i++) {
        const currentKey = keys[i]
        if (!currentObj[currentKey] || typeof currentObj[currentKey] !== 'object') {
          currentObj[currentKey] = {}
        }
        currentObj = currentObj[currentKey]
      }
      currentObj[keys[keys.length - 1]] = value
      return newData
    })
  }, [])

  const setErrorState = (key: string, error: boolean) => {
    setErrors((prev) => ({ ...prev, [key]: error }))
  }

  const hasErrors = Object.values(errors).some((error) => error)

  return {
    setFieldValue,
    setErrorState,
    hasErrors,
    data,
    create: () => mutate(),
    update: () => mutateUpdate(),
    isLoading: isPending || isPendingUpdate,
  }
}
