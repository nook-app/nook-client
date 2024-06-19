import { View, ViewProps } from "@nook/app-ui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const SafeAreaView = (props: ViewProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      paddingTop={insets.top}
      paddingBottom={insets.bottom}
      paddingLeft={insets.left}
      paddingRight={insets.right}
      {...props}
    />
  );
};
