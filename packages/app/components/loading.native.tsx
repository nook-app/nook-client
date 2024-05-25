"use client";
import { Spinner, View } from "@nook/app-ui";
import { Tabs } from "react-native-collapsible-tab-view";

export const Loading = ({ asTabs }: { asTabs?: boolean }) => {
  const Component = (
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
  return asTabs ? <Tabs.ScrollView>{Component}</Tabs.ScrollView> : Component;
};
