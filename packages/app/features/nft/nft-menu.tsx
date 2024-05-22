import { SimpleHashNFT } from "@nook/common/types";
import { Menu } from "../../components/menu/menu";
import { ReactNode } from "react";
import { CopyLink } from "../../components/menu/menu-actions";

export const NftMenu = ({
  nft,
  trigger,
}: { nft: SimpleHashNFT; trigger: ReactNode }) => {
  return (
    <Menu trigger={trigger}>
      <CopyLink link={`https://nook.social/collectibles/${nft.nft_id}`} />
    </Menu>
  );
};
