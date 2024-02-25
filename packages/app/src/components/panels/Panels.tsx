import { NookPanel, NookPanelType } from "@nook/common/types";
import {
  MaterialTabBar,
  TabBarProps,
  Tabs,
} from "react-native-collapsible-tab-view";
import { ContentFeedPanel } from "./ContentFeedPanel";
import { useTheme } from "tamagui";
import { useCallback } from "react";

export const Panels = ({
  panels,
  renderHeader,
}: {
  panels: NookPanel[];
  renderHeader?: () => JSX.Element | null;
}) => {
  const theme = useTheme();

  const renderTabBar = useCallback((props: TabBarProps) => {
    const theme = useTheme();
    return (
      <MaterialTabBar
        {...props}
        style={{
          backgroundColor: theme.$background.val,
        }}
        labelStyle={{
          color: theme.$color12.val,
          fontWeight: "700",
          textTransform: "capitalize",
        }}
        activeColor={theme.$color12.val}
        inactiveColor={theme.$gray11.val}
        indicatorStyle={{
          backgroundColor: theme.$color9.val,
        }}
        tabStyle={{
          height: "auto",
          paddingVertical: 4,
          paddingHorizontal: 6,
        }}
        scrollEnabled
        keepActiveTabCentered
      />
    );
  }, []);

  return (
    <Tabs.Container
      renderHeader={renderHeader}
      renderTabBar={renderTabBar}
      headerContainerStyle={{
        shadowOpacity: 0,
        elevation: 0,
        borderBottomWidth: 1,
        borderBottomColor: theme.$borderColor.val,
      }}
      containerStyle={{
        backgroundColor: theme.$background.val,
      }}
    >
      {panels.map(({ name, type, args }) => {
        if (type === NookPanelType.ContentFeed) {
          return (
            <Tabs.Tab key={name} name={name}>
              <ContentFeedPanel asTabs args={args} />
            </Tabs.Tab>
          );
        }
        return null;
      })}
    </Tabs.Container>
  );
};
