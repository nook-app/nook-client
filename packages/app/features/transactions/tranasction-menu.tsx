import { FarcasterUser, Transaction } from "@nook/common/types";
import { Menu } from "../../components/menu/menu";
import { OpenLink } from "../../components/menu/menu-actions";
import { CdnAvatar } from "../../components/cdn-avatar";
import { useAuth } from "../../context/auth";
import { useMenu } from "../../components/menu/context";
import { Link } from "../../components/link";
import { MenuItem } from "../../components/menu/menu-item";
import { MenuSquare } from "@tamagui/lucide-icons";

export const TransactionMenu = ({
  transaction,
}: { transaction: Transaction }) => {
  const user = transaction.users[transaction.from];
  return (
    <Menu>
      {user && <AddUserToList user={user} />}
      <OpenLink
        Icon={
          <CdnAvatar
            size="$1"
            src="https://www.onceupon.xyz/once-upon-mark.svg"
            absolute
          />
        }
        title={"View on OnceUpon"}
        link={`https://www.onceupon.xyz/${transaction.hash}`}
      />
    </Menu>
  );
};

const AddUserToList = ({ user }: { user: FarcasterUser }) => {
  const { session } = useAuth();
  const { close } = useMenu();

  if (!session) {
    return null;
  }

  return (
    <Link
      href={{
        pathname: "/lists/manage",
        params: { user: JSON.stringify(user) },
      }}
      onPress={close}
    >
      <MenuItem Icon={MenuSquare} title="Add/remove from user list" />
    </Link>
  );
};
