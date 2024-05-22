import { SimpleHashNFT } from "@nook/common/types";
import { Menu } from "../../components/menu/menu";
import { ReactNode } from "react";
import { CopyLink, OpenLink } from "../../components/menu/menu-actions";

export const NftMenu = ({
  nft,
  trigger,
}: { nft: SimpleHashNFT; trigger: ReactNode }) => {
  const parts = nft.nft_id.split(".");
  return (
    <Menu trigger={trigger}>
      <CopyLink link={`https://nook.social/collectibles/${nft.nft_id}`} />
      <OpenLink
        link={`https://opensea.io/assets/${parts[0]}/${parts[1]}/${
          parts[2] || "0"
        }`}
        title="View on OpenSea"
      />
    </Menu>
  );
};
