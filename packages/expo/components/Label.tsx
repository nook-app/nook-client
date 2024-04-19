import { Text } from 'tamagui'

export const Label = ({ children }: { children: string }) => {
  return (
    <Text
      textTransform="uppercase"
      color="$mauve11"
      fontSize="$1"
      fontWeight="600"
      letterSpacing={0.5}
    >
      {children}
    </Text>
  )
}
