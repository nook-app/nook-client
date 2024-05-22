import { NftEvent } from "@nook/common/types";
import { Menu } from "../../components/menu/menu";
import { OpenLink } from "../../components/menu/menu-actions";
import { CdnAvatar } from "../../components/cdn-avatar";

export const NftEventMenu = ({ event }: { event: NftEvent }) => {
  console.log(event);
  return (
    <Menu>
      <OpenLink
        Icon={
          <CdnAvatar
            size="$1"
            src="https://www.onceupon.xyz/once-upon-mark.svg"
            absolute
          />
        }
        title={"View on OnceUpon"}
        link={`https://www.onceupon.xyz/${event.transaction}`}
      />
    </Menu>
  );
};
