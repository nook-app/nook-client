import { Text } from "@nook/app-ui";
import { Link as ExpoLink, useSegments } from "expo-router";
import { Href } from "expo-router/build/link/href";
import { useMemo } from "react";
import { Linking, Pressable } from "react-native";

export const Link = ({
  href,
  children,
  absolute,
  target,
  asText,
  unpressable,
  onPress,
  isExternal,
}: {
  href: Href;
  children: React.ReactNode;
  absolute?: boolean;
  target?: string;
  asText?: boolean;
  unpressable?: boolean;
  onPress?: () => void;
  isExternal?: boolean;
}) => {
  const [drawer, tabs, tab] = useSegments();

  let formattedHref = href;
  if (!absolute && !isExternal) {
    if (typeof href === "string") {
      formattedHref = `/${drawer}/${tabs}/${tab}${href}`;
    } else {
      formattedHref = {
        ...href,
        pathname: `/${drawer}/${tabs}/${tab}${href.pathname}`,
      };
    }
  }

  if (
    isExternal &&
    typeof formattedHref === "string" &&
    !formattedHref.startsWith("http")
  ) {
    formattedHref = `https://${formattedHref}`;
  }

  const memoChildren = useMemo(() => children, [children]);

  if (asText || unpressable) {
    if (isExternal) {
      return (
        <Text onPress={() => Linking.openURL(formattedHref as string)}>
          {children}
        </Text>
      );
    }
    return (
      <ExpoLink href={formattedHref} asChild>
        {memoChildren}
      </ExpoLink>
    );
  }

  if (isExternal) {
    return (
      <Pressable
        onPress={() => {
          Linking.openURL(href as string);
          onPress?.();
        }}
      >
        {memoChildren}
      </Pressable>
    );
  }

  return (
    <ExpoLink href={formattedHref} asChild>
      <Pressable onPress={onPress}>{memoChildren}</Pressable>
    </ExpoLink>
  );
};
