import { NookText, View, XStack } from "@nook/ui";
import { ReactNode } from "react";
import { Link } from "solito/link";

type TabItem = {
  id: string;
  label: string;
  href: string;
};

export const Tabs = ({
  tabs,
  activeTab,
}: { tabs: TabItem[]; activeTab: string }) => {
  return (
    <XStack
      flexGrow={1}
      justifyContent="space-around"
      alignItems="center"
      borderBottomWidth="$0.5"
      borderBottomColor="$borderColorBg"
    >
      {tabs.map((tab, index) => (
        <Tab key={tab.label} href={tab.href} isActive={activeTab === tab.id}>
          {tab.label}
        </Tab>
      ))}
    </XStack>
  );
};

const Tab = ({
  children,
  href,
  isActive,
}: { children: ReactNode; href: string; isActive: boolean }) => {
  return (
    <Link
      href={href}
      viewProps={{
        style: {
          flex: 1,
          flexGrow: 1,
          height: "100%",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <View
        width="100%"
        alignItems="center"
        hoverStyle={{
          backgroundColor: "$color2",
        }}
        group
      >
        <View paddingHorizontal="$2" paddingVertical="$4">
          <NookText
            fontWeight={isActive ? "700" : "600"}
            muted={!isActive}
            $group-hover={{
              color: "$mauve12",
            }}
            whiteSpace="nowrap"
          >
            {children}
          </NookText>
          <View
            position="absolute"
            bottom={0}
            left={0}
            width="100%"
            height="$0.5"
            borderRadius="$4"
            backgroundColor={isActive ? "$color11" : "transparent"}
          />
        </View>
      </View>
    </Link>
  );
};
