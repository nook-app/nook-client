import { Avatar } from "@nook/ui";
import { formatToCDN } from "../utils";
import { ReactNode } from "react";

export const CdnAvatar = ({
  src,
  size,
  absolute,
  children,
}: {
  src?: string;
  size: string;
  absolute?: boolean;
  children?: ReactNode;
}) => {
  const formattedSrc =
    src && !src?.endsWith(".svg") ? formatToCDN(src, { width: 168 }) : src;

  return (
    <Avatar circular size={size}>
      <Avatar.Image src={formattedSrc} />
      <Avatar.Fallback backgroundColor="$color3">{children}</Avatar.Fallback>
    </Avatar>
  );
};
