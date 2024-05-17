import { ListType } from "@nook/common/types";
import { Link } from "../../components/link";
import { Button } from "@nook/app-ui";

export const CreateListTrigger = ({ type }: { type?: ListType }) => {
  return (
    <Link
      href={{
        pathname: "/create/list",
        params: { type },
      }}
      unpressable
      absolute
    >
      <Button
        height="$4"
        width="100%"
        borderRadius="$10"
        fontWeight="600"
        fontSize="$5"
        backgroundColor="$mauve12"
        borderWidth="$0"
        color="$mauve1"
        pressStyle={{
          backgroundColor: "$mauve11",
        }}
        disabledStyle={{
          backgroundColor: "$mauve10",
        }}
      >
        Create List
      </Button>
    </Link>
  );
};
