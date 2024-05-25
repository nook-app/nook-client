"use client";
import { Spinner, View } from "@nook/app-ui";

export const Loading = ({ asTabs }: { asTabs?: boolean }) => (
  <View
    flexGrow={1}
    justifyContent="center"
    alignItems="center"
    padding="$8"
    backgroundColor="$color1"
  >
    <View width="$3" height="$3">
      <Spinner size="large" />
    </View>
  </View>
);
