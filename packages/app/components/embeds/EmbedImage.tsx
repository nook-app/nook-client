import { View, XStack, Image } from "@nook/ui";
import { useEffect, useState } from "react";
import { ZoomableImage } from "../zoomable-image";

export const EmbedImages = ({ uris }: { uris: string[] }) => {
  if (uris.length === 1) {
    return <EmbedImage uri={uris[0]} />;
  }

  return (
    <XStack borderRadius="$4" overflow="hidden" gap="$2">
      {uris.map((uri, index) => (
        <View width="50%" key={uri}>
          <EmbedImage uri={uri} />
        </View>
      ))}
    </XStack>
  );
};

export const EmbedImage = ({ uri }: { uri: string }) => {
  return (
    <View
      borderRadius="$4"
      overflow="hidden"
      onPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <ZoomableImage uri={uri}>
        <img src={uri} alt="" />
      </ZoomableImage>
    </View>
  );
};
