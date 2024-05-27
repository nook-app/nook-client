import { View } from "@nook/app-ui";
import { SimpleHashNFT } from "@nook/common/types";
import { Image } from "expo-image";

export const TransactionDisplayNFT = ({ nft }: { nft: SimpleHashNFT }) => {
  const uri = nft.previews.image_medium_url || nft.collection.image_url;
  if (!uri) return null;

  const aspectRatio = nft.image_properties
    ? (nft.image_properties.width || 1) / (nft.image_properties.height || 1)
    : nft.collection.image_properties
      ? (nft.collection.image_properties.width || 1) /
        (nft.collection.image_properties.height || 1)
      : 1;

  return (
    <View alignItems="center">
      <View borderRadius="$4" overflow="hidden">
        <Image
          source={{ uri }}
          style={{
            aspectRatio,
            width: "100%",
            maxHeight: 400,
          }}
          placeholder={{
            blurhash: nft.previews.blurhash || undefined,
          }}
          placeholderContentFit="cover"
        />
      </View>
    </View>
  );
};
