import { useAuth } from "../../../context/auth";
import { Link } from "../../../components/link";
import { memo, useMemo } from "react";

export const EnableSignerDialog = memo(
  ({ children }: { children: React.ReactNode }) => {
    const { session, signer } = useAuth();

    const memoChildren = useMemo(() => children, [children]);

    if (!session || signer?.state === "completed") {
      return memoChildren;
    }

    return (
      <Link href="/enable-signer" absolute unpressable>
        {memoChildren}
      </Link>
    );
  },
);
