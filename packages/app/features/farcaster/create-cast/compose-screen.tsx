"use client";

import { ScrollView, View } from "@nook/app-ui";
import { CreateCastProvider } from "./context";
import { CreateCastItem } from "./form";
import { CreateCastActionBar } from "./action-bar";

export const ComposeScreen = (props: {
  text?: string;
  "embeds[]"?: string;
}) => {
  return (
    <CreateCastProvider
      initialCast={{
        text: props.text ?? "",
        embeds: props["embeds[]"]?.split(",") ?? [],
      }}
    >
      <ScrollView
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="always"
        $platform-web={{
          maxHeight: "75vh",
        }}
      >
        <View padding="$3" zIndex={1}>
          <CreateCastItem index={0} />
        </View>
      </ScrollView>
      <CreateCastActionBar />
    </CreateCastProvider>
  );
};
