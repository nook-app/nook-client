import { Link as ExpoLink, useSegments } from "expo-router";
import { Href } from "expo-router/build/link/href";
import { useMemo } from "react";
import { Pressable } from "react-native";

export const Link = ({
  href,
  children,
  absolute,
  target,
  asText,
  unpressable,
  onPress,
}: {
  href: Href;
  children: React.ReactNode;
  absolute?: boolean;
  target?: string;
  asText?: boolean;
  unpressable?: boolean;
  onPress?: () => void;
}) => {
  const [drawer, tabs, tab] = useSegments();

  let formattedHref = href;
  if (!absolute) {
    if (typeof href === "string") {
      formattedHref = `/${drawer}/${tabs}/${tab}${href}`;
    } else {
      formattedHref = {
        ...href,
        pathname: `/${drawer}/${tabs}/${tab}${href.pathname}`,
      };
    }
  }

  const memoChildren = useMemo(() => children, [children]);

  if (asText || unpressable) {
    return (
      <ExpoLink href={formattedHref} asChild>
        {memoChildren}
      </ExpoLink>
    );
  }

  return (
    <ExpoLink href={formattedHref} asChild>
      <Pressable onPress={onPress}>{memoChildren}</Pressable>
    </ExpoLink>
  );
};
