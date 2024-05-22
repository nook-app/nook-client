import { Avatar } from "@nook/app-ui";
import { formatToCDN } from "../utils";
import { ReactNode } from "react";

export const CdnAvatar = ({
  src,
  size,
  absolute,
  children,
  skipCdn,
  borderRadius,
}: {
  src?: string;
  size: string;
  absolute?: boolean;
  children?: ReactNode;
  skipCdn?: boolean;
  borderRadius?: string;
}) => {
  const formattedSrc =
    src && !src?.endsWith(".svg") && !absolute && !skipCdn
      ? formatToCDN(src, { width: 168 })
      : src;

  return (
    <Avatar
      circular={!borderRadius}
      size={size}
      display="inline-flex"
      // @ts-ignore
      borderRadius={borderRadius}
    >
      <Avatar.Image src={formattedSrc || undefined} key={formattedSrc} />
      <Avatar.Fallback backgroundColor="$color3">{children}</Avatar.Fallback>
    </Avatar>
  );
};
