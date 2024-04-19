import { Button as TamaguiButton } from 'tamagui'
import { ReactNode } from 'react'

export const Button = ({
  children,
  onPress,
  variant,
  disabled,
  ...rest
}: {
  children: ReactNode
  onPress?: () => void
  variant?: 'outlined' | 'primary' | 'primary-outlined'
  disabled?: boolean
  [key: string]: any
}) => {
  const styles =
    variant === 'outlined'
      ? {
          backgroundColor: 'transparent',
          borderColor: '$color3',
        }
      : variant === 'primary'
        ? {
            backgroundColor: '$mauve12',
            borderRadius: '$10',
            size: '$3',
            paddingHorizontal: '$3',
            color: '$color1',
            fontWeight: '600',
          }
        : variant === 'primary-outlined'
          ? {
              backgroundColor: 'transparent',
              borderColor: '$color6',
              borderRadius: '$10',
              size: '$3',
              paddingHorizontal: '$3',
              color: '$color12',
              fontWeight: '500',
            }
          : {
              backgroundColor: '$color4',
              borderColor: '$color6',
            }

  return (
    // @ts-ignore
    <TamaguiButton
      onPress={onPress}
      pressStyle={{ backgroundColor: '$color3', borderColor: '$color4' }}
      paddingHorizontal="$2"
      disabled={disabled}
      {...styles}
      {...rest}
    >
      {children}
    </TamaguiButton>
  )
}
