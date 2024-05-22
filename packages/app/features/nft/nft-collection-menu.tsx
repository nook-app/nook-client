import { SimpleHashCollection } from "@nook/common/types";
import { Menu } from "../../components/menu/menu";
import { ReactNode } from "react";
import { CopyLink, OpenLink } from "../../components/menu/menu-actions";

export const NftCollectionMenu = ({
  collection,
  trigger,
}: { collection: SimpleHashCollection; trigger: ReactNode }) => {
  return (
    <Menu trigger={trigger}>
      <CopyLink
        link={`https://nook.social/collections/${collection.collection_id}`}
      />
      {collection.marketplace_pages?.map((page) => (
        <OpenLink
          key={page.marketplace_id}
          link={page.collection_url}
          title={`View on ${page.marketplace_name}`}
        />
      ))}
    </Menu>
  );
};
