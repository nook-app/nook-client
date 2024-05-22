import { View } from "@nook/app-ui";
import { SimpleHashNFT } from "@nook/common/types";
import { Image } from "expo-image";
import { Link } from "../../components/link";

export const NftDisplay = ({ nft }: { nft: SimpleHashNFT }) => {
  const image = nft.previews.image_medium_url;
  return (
    <Link
      href={{
        pathname: "/collectibles/[nftId]",
        params: { nftId: nft.nft_id },
      }}
      unpressable
    >
      <View
        backgroundColor="$color2"
        aspectRatio={1}
        flexGrow={1}
        borderRadius="$4"
        overflow="hidden"
        margin="$1.5"
      >
        {image && (
          <Image
            recyclingKey={image}
            source={{ uri: image }}
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        )}
      </View>
    </Link>
  );
};
