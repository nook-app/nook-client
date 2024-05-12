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
}: {
  href: Href;
  children: React.ReactNode;
  absolute?: boolean;
  target?: string;
  asText?: boolean;
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

  return (
    <ExpoLink href={formattedHref} asChild>
      <Pressable>{memoChildren}</Pressable>
    </ExpoLink>
  );
};
