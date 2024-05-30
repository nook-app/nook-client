import { View } from "@nook/app-ui";
import { FarcasterCastV1 } from "@nook/common/types";
import { Image } from "expo-image";
import { formatToCDN } from "../../../utils";

export const FarcasterCastResponseGridDisplay = ({
  cast,
}: { cast: FarcasterCastV1 }) => {
  const imageEmbed = cast.embeds.find(
    (embed) =>
      embed.contentType?.startsWith("image") || embed.uri.startsWith("data:"),
  );

  if (!imageEmbed) {
    return null;
  }

  return (
    <View
      borderRightWidth="$0.5"
      width="100%"
      aspectRatio={1}
      borderColor="$borderColorBg"
      hoverStyle={{
        // @ts-ignore
        transition: "all 0.2s ease-in-out",
        opacity: 0.75,
      }}
    >
      <Image
        recyclingKey={imageEmbed.uri}
        source={{ uri: formatToCDN(imageEmbed.uri) }}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </View>
  );
};
