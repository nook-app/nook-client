import { Menu } from "../../components/menu/menu";
import { ReactNode } from "react";
import { OpenLink } from "../../components/menu/menu-actions";
import { Token } from "@nook/common/types";
import { CdnAvatar } from "../../components/cdn-avatar";

export const TokenMenu = ({
  token,
  trigger,
}: { token: Token; trigger: ReactNode }) => {
  const instance = token.instances.find(({ address }) => address !== null);
  if (!instance) return null;

  return (
    <Menu trigger={trigger}>
      <OpenLink
        Icon={
          <CdnAvatar
            size="$1"
            src="https://www.onceupon.xyz/once-upon-mark.svg"
            absolute
          />
        }
        title={"View on OnceUpon"}
        link={`https://www.onceupon.xyz/${instance.address}`}
      />
      {token.externalLinks.map((link) => (
        <OpenLink key={link.url} title={link.name} link={link.url} />
      ))}
    </Menu>
  );
};
