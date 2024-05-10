"use client";
import { Spinner, View } from "@nook/app-ui";

export const Loading = () => (
  <View flexGrow={1} justifyContent="center" alignItems="center" padding="$8">
    <View width="$3" height="$3">
      <Spinner size="large" />
    </View>
  </View>
);
