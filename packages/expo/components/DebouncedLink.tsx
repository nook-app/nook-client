import { useDebouncedNavigate } from '@/hooks/useDebouncedNavigate'
import { Href } from 'expo-router/build/link/href'
import { ReactNode, memo, useCallback } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { View } from 'tamagui'

export const DebouncedLink = memo(
  ({
    href,
    children,
    disabled,
    replace,
    asChild,
    onPress,
    onLongPress,
    absolute,
  }: {
    href: Href
    children: ReactNode
    disabled?: boolean
    replace?: boolean
    asChild?: boolean
    onPress?: () => void
    onLongPress?: () => void
    absolute?: boolean
  }) => {
    const { navigate } = useDebouncedNavigate()

    const handleNavigate = useCallback(() => {
      if (disabled) return
      if (onPress) {
        onPress()
      }
      navigate(href, {
        replace,
        segments: !absolute,
      })
    }, [href, disabled, onPress, navigate, replace])

    const Component = asChild ? View : TouchableOpacity

    return (
      <Component
        onPress={handleNavigate}
        onLongPress={onLongPress}
        hitSlop={{
          top: 10,
          bottom: 10,
          left: 10,
          right: 10,
        }}
        asChild={asChild}
      >
        {children}
      </Component>
    )
  }
)
