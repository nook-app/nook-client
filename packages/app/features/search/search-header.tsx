"use client";

import { NookButton, View, XStack } from "@nook/app-ui";
import { Tabs } from "../../components/tabs/tabs";
import { SearchBar } from "./search-bar";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { useRouter } from "solito/navigation";
import { ReactNode } from "react";

export const SearchHeader = ({
  q,
  f,
  children,
}: { q: string; f?: string; children: ReactNode }) => {
  const router = useRouter();
  const activeTab = f || "casts";
  return (
    <View>
      <XStack height="$5" paddingHorizontal="$3" alignItems="center">
        <NookButton
          icon={<ArrowLeft />}
          circular
          size="$3"
          scaleIcon={1.5}
          backgroundColor="transparent"
          borderWidth="$0"
          hoverStyle={{
            // @ts-ignore
            transition: "all 0.2s ease-in-out",
            backgroundColor: "$color3",
          }}
          onPress={router.back}
        />
        <View flexGrow={1}>
          <SearchBar defaultValue={q} />
        </View>
      </XStack>
      <Tabs
        tabs={[
          {
            id: "casts",
            label: "Casts",
            href: `/search?q=${q}`,
          },
          {
            id: "users",
            label: "Users",
            href: `/search?q=${q}&f=users`,
          },
          {
            id: "channels",
            label: "Channels",
            href: `/search?q=${q}&f=channels`,
          },
        ]}
        activeTab={activeTab}
      />
      {children}
    </View>
  );
};
