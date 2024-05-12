import { View, useTheme as useTamaguiTheme } from "@nook/app-ui";
import { ReactElement, ReactNode, useCallback } from "react";
import {
  MaterialTabBar,
  TabBarProps,
  Tabs,
} from "react-native-collapsible-tab-view";

export const CollapsibleLayout = ({
  renderHeader,
  pages,
  defaultIndex = 0,
}: {
  renderHeader: (props: TabBarProps) => ReactElement;
  pages: { name: string; component: ReactNode }[];
  defaultIndex?: number;
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
    <View flex={1} backgroundColor="$color1">
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
      >
        {pages.map((page) => (
          <Tabs.Tab key={page.name} name={page.name}>
            {page.component}
          </Tabs.Tab>
        ))}
      </Tabs.Container>
    </View>
  );
};
