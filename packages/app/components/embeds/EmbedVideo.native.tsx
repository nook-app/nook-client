import { View } from "tamagui";

export const EmbedVideo = ({
  uri,
  noBorderRadius,
}: { uri: string; noBorderRadius?: boolean }) => {
  if (!uri) return null;
  return (
    <View
      overflow="hidden"
      borderRadius={noBorderRadius ? "$0" : "$4"}
      onPress={(e) => {
        e.stopPropagation();
      }}
      aspectRatio={
        uri.includes("youtube.com") || uri.includes("youtu.be")
          ? 16 / 9
          : "auto"
      }
    />
  );
};
