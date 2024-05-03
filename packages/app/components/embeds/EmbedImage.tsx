import { View, XStack } from "@nook/ui";
import { ZoomableImage } from "../zoomable-image";
import { formatToCDN } from "../../utils";

export const EmbedImages = ({ uris }: { uris: string[] }) => {
  if (uris.length === 1) {
    return <EmbedImage uri={uris[0]} />;
  }

  return (
    <XStack borderRadius="$4" overflow="hidden" gap="$2">
      {uris.map((uri, index) => (
        <View width="50%" key={uri}>
          <EmbedImage uri={formatToCDN(uri)} />
        </View>
      ))}
    </XStack>
  );
};

export const EmbedImage = ({
  uri,
  noBorderRadius,
}: { uri: string; noBorderRadius?: boolean }) => {
  return (
    <View
      borderRadius={noBorderRadius ? "$0" : "$4"}
      overflow="hidden"
      onPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <ZoomableImage uri={uri}>
        <img src={formatToCDN(uri)} alt="" />
      </ZoomableImage>
    </View>
  );
};
