import { Theme, ThemeName, View, XStack } from "@nook/app-ui";
import { NamedExoticComponent } from "react";
import { Link } from "../../components/link";

export const Notification = ({
  Icon,
  children,
  href,
  theme,
}: {
  Icon?: NamedExoticComponent;
  children: JSX.Element;
  href: string;
  theme?: string;
}) => {
  return (
    <Link href={href}>
      <XStack
        hoverStyle={{
          // @ts-ignore
          transition: "all 0.2s ease-in-out",
          backgroundColor: "$color2",
        }}
        paddingHorizontal="$2"
        cursor="pointer"
      >
        {Icon && (
          <Theme name={theme as ThemeName | undefined}>
            <View width="$6" alignItems="flex-end" padding="$3">
              <View
                cursor="pointer"
                width="$2.5"
                height="$2.5"
                justifyContent="center"
                alignItems="center"
                borderRadius="$10"
                backgroundColor="$color3"
              >
                {/* @ts-ignore */}
                <Icon color="$color9" size={18} />
              </View>
            </View>
          </Theme>
        )}
        {children}
      </XStack>
    </Link>
  );
};
