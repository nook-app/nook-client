"use client";

import { View } from "@nook/ui";
import { CreateCastProvider } from "./context";
import { CreateCastEditor } from "./form";

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
      <View padding="$3">
        <CreateCastEditor />
      </View>
    </CreateCastProvider>
  );
};
