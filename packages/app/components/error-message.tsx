import { Text, View } from "@nook/ui";
import { ReactNode } from "react";

export const ErrorMessage = ({ children }: { children: ReactNode }) => (
  <View justifyContent="center" alignItems="center" flex={1} padding="$10">
    <Text>{children}</Text>
  </View>
);
