import { List, ListType } from "@nook/common/types";
import { Menu } from "../../components/menu/menu";
import { Link } from "../../components/link";
import { MenuItem } from "../../components/menu/menu-item";
import { Settings, UserPlus, Image } from "@tamagui/lucide-icons";
import { ReactNode } from "react";
import { useMenu } from "../../components/menu/context";

export const ListMenu = ({
  list,
  trigger,
}: { list: List; trigger: ReactNode }) => {
  return (
    <Menu trigger={trigger}>
      <ListMenuItems list={list} />
    </Menu>
  );
};

const ListMenuItems = ({ list }: { list: List }) => {
  const { close } = useMenu();
  return (
    <>
      <Link href={`/lists/${list.id}/settings/items`} onPress={close}>
        <MenuItem
          title={`Add or remove ${
            list.type === ListType.USERS ? "users" : "channels"
          }`}
          Icon={UserPlus}
        />
      </Link>
      <Link href={`/lists/${list.id}/settings`} onPress={close}>
        <MenuItem title="Edit list settings" Icon={Settings} />
      </Link>
      <Link href={`/lists/${list.id}/settings/display`} onPress={close}>
        <MenuItem title="Edit display mode" Icon={Image} />
      </Link>
    </>
  );
};
