import { ReactElement, ReactNode, useCallback } from 'react'
import { MaterialTabBar, TabBarProps, Tabs } from 'react-native-collapsible-tab-view'
import { useTheme } from 'tamagui'

export const Panels = ({
  renderHeader,
  panels,
  defaultIndex,
}: {
  renderHeader?: (props: TabBarProps) => ReactElement
  panels: {
    name: string
    panel: ReactNode
  }[]
  defaultIndex?: number
}) => {
  const theme = useTheme()

  const renderTabBar = useCallback(
    (props: TabBarProps) => {
      return (
        <MaterialTabBar
          {...props}
          style={{
            backgroundColor: theme.color1.val,
            paddingHorizontal: 4,
          }}
          labelStyle={{
            fontWeight: '700',
            textTransform: 'capitalize',
            fontSize: 14,
          }}
          activeColor={theme.mauve12.val}
          inactiveColor={theme.mauve11.val}
          indicatorStyle={{
            backgroundColor: theme.color11.val,
            height: 3,
            borderRadius: 4,
          }}
          tabStyle={{
            height: 'auto',
            paddingVertical: 8,
            paddingHorizontal: 4,
            marginHorizontal: props.tabNames.length > 1 ? 4 : 0,
          }}
          scrollEnabled
          keepActiveTabCentered
        />
      )
    },
    [theme]
  )

  return (
    <Tabs.Container
      initialTabName={panels[defaultIndex ?? 0]?.name}
      renderHeader={renderHeader}
      renderTabBar={renderTabBar}
      headerContainerStyle={{
        shadowOpacity: 0,
        elevation: 0,
        borderBottomWidth: 1,
        borderBottomColor: theme.borderColor.val,
      }}
      containerStyle={{
        backgroundColor: theme.color1.val,
      }}
    >
      {panels.map((panel) => (
        <Tabs.Tab key={panel.name} name={panel.name}>
          {panel.panel}
        </Tabs.Tab>
      ))}
    </Tabs.Container>
  )
}
