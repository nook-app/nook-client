import { Text, View } from "tamagui";
import { UrlContentResponse } from "../../types";

export const EmbedVideo = ({
  content: { uri },
}: {
  content: UrlContentResponse;
}) => {
  return (
    <View
      position="relative"
      justifyContent="center"
      alignItems="center"
      overflow="hidden"
    >
      <Text>{`Video: ${uri}`}</Text>
    </View>
  );
};
