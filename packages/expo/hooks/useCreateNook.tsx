import { Nook, Panel, User } from '@/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { useState } from 'react'
import { useDrawer } from '../context/drawer'
import { useAuth } from '../context/auth'
import { makeRequestJson } from '@/utils/api'
import { useDebouncedNavigate } from './useDebouncedNavigate'

export const useCreateNook = () => {
  const [name, setName] = useState<string>('')
  const [panels, setPanels] = useState<Panel[]>([])
  const queryClient = useQueryClient()
  const { onClose } = useDrawer()
  const { session } = useAuth()
  const { navigate } = useDebouncedNavigate()

  const { mutate, isPending } = useMutation<Nook>({
    mutationFn: () =>
      makeRequestJson('/groups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          panels,
        }),
      }),
    onSuccess: (nookData) => {
      queryClient.setQueryData<Nook>(['nook', nookData.id], nookData)
      queryClient.setQueryData<User>(['authUser', session?.fid], (prev) => {
        if (!prev) return prev
        return {
          ...prev,
          nooks: [...prev.nooks, nookData],
          metadata: {
            ...prev.metadata,
            order: [
              ...(prev.metadata?.order || []),
              [nookData.id, nookData.panels.map((p) => p.id)],
            ],
          },
        }
      })
      while (router.canGoBack()) router.back()
      navigate(
        {
          pathname: '/nooks/[nookId]',
          params: { nookId: nookData.id },
        },
        {
          replace: true,
        }
      )
      onClose()
    },
  })

  const { mutate: mutateUpdate, isPending: isPendingUpdate } = useMutation({
    mutationFn: async (nookId: string) => {
      return await makeRequestJson(`/groups/${nookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          panels,
        }),
      })
    },
    onSuccess: (nookData) => {
      queryClient.setQueryData<Nook>(['nook', nookData.id], nookData)
      queryClient.setQueryData<User>(['authUser', session?.fid], (prev) => {
        if (!prev) return prev
        return {
          ...prev,
          nooks: prev.nooks.map((n) => (n.id === nookData.id ? nookData : n)),
          metadata: {
            ...prev.metadata,
            order: prev.metadata?.order?.map((g) =>
              g[0] === nookData.id ? [g[0], nookData.panels.map((p: Panel) => p.id)] : g
            ),
          },
        }
      })
      while (router.canGoBack()) router.back()
      navigate(
        {
          pathname: '/nooks/[nookId]',
          params: { nookId: nookData.id },
        },
        {
          replace: true,
        }
      )
      onClose()
    },
  })

  return {
    name,
    setName,
    panels,
    setPanels,
    create: () => mutate(),
    update: (nookId: string) => mutateUpdate(nookId),
    isLoading: isPending || isPendingUpdate,
  }
}
