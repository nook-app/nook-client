import { List, ListType } from "@nook/common/types";
import { Menu } from "../../components/menu/menu";
import { Link } from "../../components/link";
import { MenuItem } from "../../components/menu/menu-item";
import { Settings, UserPlus } from "@tamagui/lucide-icons";
import { ReactNode } from "react";

export const ListMenu = ({
  list,
  trigger,
}: { list: List; trigger: ReactNode }) => {
  return (
    <Menu trigger={trigger}>
      <Link href={`/lists/${list.id}/settings/items`}>
        <MenuItem
          title={`Manage ${
            list.type === ListType.USERS ? "users" : "channels"
          }`}
          Icon={UserPlus}
        />
      </Link>
      <Link href={`/lists/${list.id}/settings`}>
        <MenuItem title="Edit list" Icon={Settings} />
      </Link>
    </Menu>
  );
};
