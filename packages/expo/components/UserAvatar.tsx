import { formatToWarpcastCDN } from '@/utils'
import { Image } from 'expo-image'
import { ReactNode } from 'react'
import { SvgUri } from 'react-native-svg'
import { View } from 'tamagui'

export const UserAvatar = ({
  pfp,
  size,
  children,
  useCdn = true,
}: { pfp?: string; size: string; children?: ReactNode; useCdn?: boolean }) => {
  const src = pfp && useCdn ? formatToWarpcastCDN(pfp, { width: 96 }) : pfp
  const isSvg = pfp?.endsWith('.svg')
  return (
    <View
      borderRadius="$10"
      width={size}
      height={size}
      backgroundColor="$color3"
      overflow="hidden"
      alignItems="center"
      justifyContent="center"
    >
      {children}
      {isSvg ? (
        <SvgUri uri={pfp as string} width="100%" height="100%" />
      ) : (
        <Image
          recyclingKey={src}
          source={{ uri: src as string }}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </View>
  )
}
