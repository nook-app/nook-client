import { Avatar } from "@nook/ui";
import { formatToCDN } from "../utils";

export const CdnAvatar = ({
  src,
  size,
  absolute,
}: { src?: string; size: string; absolute?: boolean }) => {
  const formattedSrc =
    src && !src?.endsWith(".svg") ? formatToCDN(src, { width: 96 }) : src;
  return (
    <Avatar circular size={size}>
      <Avatar.Image src={formattedSrc} />
      <Avatar.Fallback bc="red" />
    </Avatar>
  );
};
