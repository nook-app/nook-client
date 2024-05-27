import { SimpleHashNFT } from "@nook/common/types";
import { EmbedImage } from "../../components/embeds/EmbedImage";

export const TransactionDisplayNFT = ({ nft }: { nft: SimpleHashNFT }) => {
  const uri = nft.previews.image_medium_url || nft.collection.image_url;
  if (!uri) return null;

  return <EmbedImage uri={uri} disableZoom />;
};
