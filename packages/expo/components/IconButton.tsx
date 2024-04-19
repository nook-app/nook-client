import { Href } from 'expo-router/build/link/href'
import { ReactNode } from 'react'
import { DebouncedLink } from './DebouncedLink'
import { View } from 'tamagui'
import { TouchableOpacity } from 'react-native-gesture-handler'

export const IconButton = ({
  href,
  onPress,
  children,
}: { href?: Href; onPress?: () => void; children: ReactNode }) => {
  if (href) {
    return (
      <DebouncedLink href={href} onPress={onPress}>
        <View
          backgroundColor="rgba(0,0,0,0.2)"
          padding="$2"
          borderRadius="$10"
          alignItems="center"
          justifyContent="center"
        >
          {children}
        </View>
      </DebouncedLink>
    )
  }

  return (
    <TouchableOpacity
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      onPress={onPress}
    >
      <View
        backgroundColor="rgba(0,0,0,0.2)"
        padding="$2"
        borderRadius="$10"
        alignItems="center"
        justifyContent="center"
      >
        {children}
      </View>
    </TouchableOpacity>
  )
}
