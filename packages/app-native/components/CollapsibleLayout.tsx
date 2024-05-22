import { View, useTheme as useTamaguiTheme } from "@nook/app-ui";
import { ReactElement, ReactNode, useCallback, useState } from "react";
import {
  MaterialTabBar,
  TabBarProps,
  Tabs,
} from "react-native-collapsible-tab-view";
import { NAVIGATION_HEIGHT } from "./PagerLayout";
import { useFocusEffect } from "expo-router";

export const CollapsibleLayout = ({
  renderHeader,
  pages,
  defaultIndex = 0,
  minHeaderHeight = NAVIGATION_HEIGHT,
}: {
  renderHeader: (props: TabBarProps) => ReactElement;
  pages: { name: string; component: ReactNode }[];
  defaultIndex?: number;
  minHeaderHeight?: number;
}) => {
  const theme = useTamaguiTheme();

  const renderTabBar = useCallback(
    (props: TabBarProps) => {
      return (
        <MaterialTabBar
          {...props}
          labelStyle={{
            fontWeight: "600",
            textTransform: "capitalize",
            fontSize: 15,
          }}
          activeColor={theme.mauve12.val}
          inactiveColor={theme.mauve11.val}
          indicatorStyle={{
            backgroundColor: theme.color11.val,
            height: 3,
            borderRadius: 9,
          }}
          tabStyle={{
            height: "auto",
            paddingVertical: 8,
            paddingHorizontal: 2,
            marginHorizontal: props.tabNames.length > 1 ? 4 : 0,
          }}
          scrollEnabled
          keepActiveTabCentered
        />
      );
    },
    [theme],
  );

  return (
    <View flexGrow={1} backgroundColor="$color1">
      <Tabs.Container
        initialTabName={pages[defaultIndex]?.name}
        renderHeader={renderHeader}
        renderTabBar={renderTabBar}
        headerContainerStyle={{
          shadowOpacity: 0,
          elevation: 0,
          borderBottomWidth: 1,
          backgroundColor: theme.color1.val,
          borderBottomColor: theme.borderColorBg.val,
        }}
        containerStyle={{
          backgroundColor: theme.color1.val,
        }}
        lazy
        minHeaderHeight={minHeaderHeight}
      >
        {pages.map((page) => (
          <Tabs.Tab key={page.name} name={page.name}>
            <LazyComponent>{page.component}</LazyComponent>
          </Tabs.Tab>
        ))}
      </Tabs.Container>
    </View>
  );
};

const LazyComponent = ({ children }: { children: ReactNode }) => {
  const [show, setShow] = useState(false);

  useFocusEffect(useCallback(() => setShow(true), []));

  if (!show) return null;

  return <>{children}</>;
};
