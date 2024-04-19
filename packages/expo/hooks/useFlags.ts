import { fetchFlags } from '@/utils/api/flags'
import { useQuery } from '@tanstack/react-query'

export const useFlags = () => {
  const { data } = useQuery({
    queryKey: ['flags'],
    queryFn: fetchFlags,
    staleTime: 60 * 60 * 1000,
  })

  return {
    flags: data,
  }
}
