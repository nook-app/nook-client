import { ReactNode } from "react";
import { Link } from "./link";

export const ZoomableImage = ({
  uri,
  children,
}: {
  uri?: string;
  children: ReactNode;
}) => {
  if (!uri) return children;

  return (
    <Link
      href={{
        pathname: "/image/[url]",
        params: { url: uri },
      }}
      absolute
      unpressable
    >
      {children}
    </Link>
  );
};
