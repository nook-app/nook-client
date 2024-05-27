import { Button, Text } from "@nook/app-ui";
import { Link as ExpoLink, useSegments } from "expo-router";
import { Href } from "expo-router/build/link/href";
import { memo, useMemo } from "react";
import { Linking, Pressable } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

export const Link = memo(
  ({
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
          <Text
            onPress={() => {
              onPress?.();
              Linking.openURL(formattedHref as string);
            }}
          >
            {memoChildren}
          </Text>
        );
      }

      return (
        <ExpoLink href={formattedHref} asChild onPress={onPress}>
          {memoChildren}
        </ExpoLink>
      );
    }

    if (isExternal) {
      if (touchable) {
        return (
          <TouchableOpacity
            onPress={() => {
              onPress?.();
              Linking.openURL(href as string);
            }}
          >
            {memoChildren}
          </TouchableOpacity>
        );
      }
      return (
        <Pressable
          onPress={() => {
            onPress?.();
            Linking.openURL(href as string);
          }}
        >
          {memoChildren}
        </Pressable>
      );
    }

    if (touchable) {
      return (
        <ExpoLink href={formattedHref} asChild onPress={onPress}>
          <TouchableOpacity>{memoChildren}</TouchableOpacity>
        </ExpoLink>
      );
    }

    return (
      <ExpoLink href={formattedHref} asChild onPress={onPress}>
        <Pressable>{memoChildren}</Pressable>
      </ExpoLink>
    );
  },
);

export const LinkButton = ({
  children,
  href,
  ...props
}: { children: React.ReactNode; href: string }) => {
  return (
    <Button
      height="$5"
      width="100%"
      borderRadius="$10"
      backgroundColor="$mauve12"
      borderWidth="$0"
      hoverStyle={{
        backgroundColor: "$mauve11",
        // @ts-ignore
        transition: "all 0.2s ease-in-out",
      }}
      pressStyle={{
        backgroundColor: "$mauve11",
      }}
      disabledStyle={{
        backgroundColor: "$mauve10",
      }}
      onPress={() => {
        Linking.openURL(href);
      }}
    >
      {children}
    </Button>
  );
};
