import { View } from "@nook/app-ui";
import { SimpleHashNFT } from "@nook/common/types";
import { Link } from "../../components/link";

export const NftDisplay = ({ nft }: { nft: SimpleHashNFT }) => {
  const image = nft.previews.image_medium_url;
  return (
    <Link href={`/nfts/${nft.nft_id}`} unpressable>
      <View
        backgroundColor="$color2"
        aspectRatio={1}
        flexGrow={1}
        borderRadius="$4"
        overflow="hidden"
        margin="$1.5"
      >
        {image && (
          <img
            src={image}
            alt=""
            style={{ objectFit: "cover", aspectRatio: 1 }}
          />
        )}
      </View>
    </Link>
  );
};
