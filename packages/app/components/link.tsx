import { Link as SolitoLink, TextLink } from "solito/link";
import { Href } from "expo-router/build/link/href";
import { useMemo } from "react";

export const Link = ({
  href,
  children,
  absolute,
  target,
  asText,
  unpressable,
  onPress,
  isExternal,
  touchable,
}: {
  href: Href;
  children: React.ReactNode;
  absolute?: boolean;
  target?: string;
  asText?: boolean;
  unpressable?: boolean;
  onPress?: () => void;
  isExternal?: boolean;
  touchable?: boolean;
}) => {
  const memoChildren = useMemo(() => children, [children]);

  let formattedHref = href;
  if (
    isExternal &&
    typeof formattedHref === "string" &&
    !formattedHref.startsWith("http")
  ) {
    formattedHref = `https://${formattedHref}`;
  }

  if (asText) {
    return (
      <TextLink href={formattedHref} target={target}>
        {memoChildren}
      </TextLink>
    );
  }
  return (
    <SolitoLink href={formattedHref} target={target}>
      {memoChildren}
    </SolitoLink>
  );
};
