import { Spinner, View } from 'tamagui'

export const LoadingScreen = ({ color }: { color?: string }) => (
  <View
    padding="$3"
    alignItems="center"
    backgroundColor={color || '$color1'}
    justifyContent="center"
    flex={1}
  >
    <Spinner size="large" paddingTop="$5" />
  </View>
)
