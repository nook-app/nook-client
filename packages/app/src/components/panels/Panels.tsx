import { NookPanel, NookPanelData, NookPanelType } from "@nook/common/types";
import {
  MaterialTabBar,
  TabBarProps,
  Tabs,
} from "react-native-collapsible-tab-view";
import { ContentFeedPanel } from "./ContentFeedPanel";
import { useTheme } from "tamagui";
import { useCallback } from "react";
import { EntityListPanel } from "./EntityListPanel";

export const Panels = ({
  panels,
  renderHeader,
  defaultTab,
}: {
  panels: NookPanel[];
  renderHeader?: () => JSX.Element | null;
  defaultTab?: string;
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
      initialTabName={defaultTab}
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
      {panels.map(({ name, data }) => (
        <Tabs.Tab key={name} name={name}>
          <Panel panel={data} asTabs />
        </Tabs.Tab>
      ))}
    </Tabs.Container>
  );
};

export const Panel = ({
  panel,
  asTabs,
}: { panel: NookPanelData; asTabs?: boolean }) => {
  if (
    [
      NookPanelType.UserPosts,
      NookPanelType.ChannelPosts,
      NookPanelType.PostReplies,
      NookPanelType.PostQuotes,
    ].includes(panel.type)
  ) {
    return <ContentFeedPanel asTabs={asTabs} panel={panel} />;
  }

  if (
    [
      NookPanelType.UserFollowers,
      NookPanelType.UserFollowing,
      NookPanelType.PostLikes,
      NookPanelType.PostReposts,
    ].includes(panel.type)
  ) {
    return <EntityListPanel asTabs={asTabs} panel={panel} />;
  }

  return null;
};
