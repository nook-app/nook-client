import { View, XStack } from "@nook/app-ui";
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
          <EmbedImage uri={uri} />
        </View>
      ))}
    </XStack>
  );
};

export const EmbedImage = ({
  uri,
  noBorderRadius,
  skipCdn,
  blurhash,
  disableZoom,
}: {
  uri: string;
  noBorderRadius?: boolean;
  skipCdn?: boolean;
  blurhash?: string;
  disableZoom?: boolean;
}) => {
  const Component = <img src={skipCdn ? uri : formatToCDN(uri)} alt="" />;

  if (disableZoom) return Component;

  return (
    <View
      borderRadius={noBorderRadius ? "$0" : "$4"}
      overflow="hidden"
      onPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <ZoomableImage uri={uri}>{Component}</ZoomableImage>
    </View>
  );
};
