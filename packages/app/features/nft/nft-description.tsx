import { Text,  } from "@nook/app-ui";
import { SimpleHashNFT } from "@nook/common/types";

export const NftDescription = ({ nft }: { nft: SimpleHashNFT }) => {
  return (
    <Text>
      {nft.description}
    </Text>
  );
};
