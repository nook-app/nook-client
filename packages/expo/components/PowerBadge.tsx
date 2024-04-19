import { useUser } from '@/hooks/useUser'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { View, useTheme } from 'tamagui'

export const PowerBadge = ({ fid }: { fid: string }) => {
  const theme = useTheme()
  const { user } = useUser(fid)

  if (!user?.badges?.powerBadge) return null

  return (
    <View backgroundColor="$color8" borderRadius="$12" padding="$0.5">
      <MaterialCommunityIcons name="lightning-bolt" size={10} color="white" />
    </View>
  )
}
