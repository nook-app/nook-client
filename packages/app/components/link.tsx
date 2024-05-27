import { Link as SolitoLink, TextLink } from "solito/link";
import { Href } from "expo-router/build/link/href";
import { useMemo } from "react";
import { Button } from "@nook/app-ui";

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
    <SolitoLink href={formattedHref} target={isExternal ? "_blank" : target}>
      {memoChildren}
    </SolitoLink>
  );
};

export const LinkButton = ({
  children,
  href,
  ...props
}: { children: React.ReactNode; href: string }) => {
  return (
    <Button
      height="$4"
      width="100%"
      borderRadius="$10"
      fontWeight="600"
      fontSize="$5"
      backgroundColor="$mauve12"
      borderWidth="$0"
      color="$mauve1"
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
        window.open(href, "_blank");
      }}
    >
      {children}
    </Button>
  );
};
