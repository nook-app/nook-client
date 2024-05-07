"use client";

import { ReactNode } from "react";
import { Tabs } from "../../components/tabs/tabs";
import { View } from "@nook/ui";
import { Session } from "@nook/common/types";
import { usePathname } from "solito/navigation";

type TabItem = {
  id: string;
  label: string;
  href: string;
  auth?: boolean;
};

export const TabNavigation = ({
  children,
  tabs,
  session,
}: { children: ReactNode; tabs: TabItem[]; session?: Session }) => {
  const pathname = usePathname();
  const tabsToRender = tabs.filter((tab) => {
    if (tab.auth) {
      return session;
    }
    return true;
  });

  const activeTab = tabsToRender.find((tab) => tab.href === pathname);

  return (
    <View flex={1}>
      <Tabs
        tabs={tabsToRender}
        activeTab={activeTab?.id || tabsToRender[0]?.id}
      />
      {children}
    </View>
  );
};
