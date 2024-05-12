import { View } from "@nook/app-ui";
import { FarcasterCastResponse } from "@nook/common/types";

export const FarcasterCastResponseGridDisplay = ({
  cast,
}: { cast: FarcasterCastResponse }) => {
  const imageEmbed = cast.embeds.find((embed) =>
    embed.contentType?.startsWith("image"),
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
      cursor="pointer"
    >
      <img
        src={imageEmbed.uri}
        alt=""
        style={{ objectFit: "cover", aspectRatio: 1 }}
      />
    </View>
  );
};
