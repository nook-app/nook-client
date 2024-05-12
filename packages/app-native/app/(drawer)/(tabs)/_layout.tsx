import { Loading } from "@nook/app/components/loading";
import { useAuth } from "@nook/app/context/auth";
import { Redirect, Tabs } from "expo-router";
import { Home, Bell, Link, UserCircle2, Sparkle } from "@tamagui/lucide-icons";
import { useTheme } from "@nook/app/context/theme";
import { BlurView } from "expo-blur";
import { NookText, View, useTheme as useTamaguiTheme } from "@nook/app-ui";
import { Svg, Path } from "react-native-svg";
import { useScroll } from "@nook/app/context/scroll";
import { NotificationsCount } from "@nook/app/features/notifications/notifications-count";
import { useNotificationsCount } from "@nook/app/api/notifications";

export default function TabLayout() {
  const { session, isInitializing } = useAuth();
  const { isScrolling } = useScroll();

  if (isInitializing) {
    return <Loading />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          borderTopWidth: 0,
          position: "absolute",
          opacity: isScrolling ? 0.5 : 1,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          tabBarIcon: (props) => <TabBarHome {...props} />,
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="(transactions)"
        options={{
          title: "Transactions",
          tabBarIcon: (props) => <TabBarTransactions {...props} />,
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="(discover)"
        options={{
          title: "Discover",
          tabBarIcon: (props) => <TabBarDiscover {...props} />,
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="(notifications)"
        options={{
          title: "Notifications",
          tabBarIcon: (props) => <TabBarNotifications {...props} />,
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
          tabBarIcon: (props) => <TabBarProfile {...props} />,
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="(media)"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(frames)"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const TabBarBackground = () => {
  const { rootTheme } = useTheme();

  return (
    <BlurView
      intensity={25}
      tint={rootTheme}
      style={{
        flex: 1,
      }}
    >
      <View
        backgroundColor="$color1"
        flex={1}
        opacity={0.75}
        borderTopWidth="$0.5"
        borderTopColor="$borderColorBg"
      />
    </BlurView>
  );
};

const TabBarHome = ({ focused }: { focused: boolean }) => {
  const theme = useTamaguiTheme();
  if (focused) {
    return (
      <Svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={theme.mauve12.val}
      >
        <Path
          d="M11.3861 1.21065C11.7472 0.929784 12.2528 0.929784 12.6139 1.21065L21.6139 8.21065C21.8575 8.4001 22 8.69141 22 9V20C22 20.7957 21.6839 21.5587 21.1213 22.1213C20.5587 22.6839 19.7957 23 19 23H16C15.4477 23 15 22.5523 15 22V14C15 13.4477 14.5523 13 14 13H10C9.44772 13 9 13.4477 9 14V22C9 22.5523 8.55228 23 8 23H5C4.20435 23 3.44129 22.6839 2.87868 22.1213C2.31607 21.5587 2 20.7957 2 20V9C2 8.69141 2.14247 8.4001 2.38606 8.21065L11.3861 1.21065Z"
          fill={theme.mauve12.val}
        />
      </Svg>
    );
  }

  return <Home color="$mauve12" />;
};

const TabBarTransactions = ({ focused }: { focused: boolean }) => {
  return <Link color="$mauve12" strokeWidth={focused ? 2.5 : 2} />;
};

const TabBarDiscover = ({ focused }: { focused: boolean }) => {
  const theme = useTamaguiTheme();
  return (
    <Sparkle
      color="$mauve12"
      fill={focused ? theme.mauve12.val : "transparent"}
    />
  );
};

const TabBarNotifications = ({ focused }: { focused: boolean }) => {
  const theme = useTamaguiTheme();

  const { data } = useNotificationsCount(true);

  const count = data?.count || 0;

  return (
    <View width="$3" height="$2.5" justifyContent="center" alignItems="center">
      <Bell
        color="$mauve12"
        fill={focused ? theme.mauve12.val : "transparent"}
      />
      {count > 0 && (
        <View
          borderRadius="$10"
          backgroundColor="$color10"
          justifyContent="center"
          alignItems="center"
          minWidth={count > 99 ? 8 : 16}
          minHeight={count > 99 ? 8 : 16}
          paddingHorizontal="$1"
          position="absolute"
          right={0}
          top={0}
        >
          {count <= 99 && (
            <NookText
              fontWeight="600"
              fontSize="$1"
              color="white"
              textAlign="center"
              verticalAlign="middle"
            >
              {count}
            </NookText>
          )}
        </View>
      )}
    </View>
  );
};

const TabBarProfile = ({ focused }: { focused: boolean }) => {
  return <UserCircle2 color="$mauve12" strokeWidth={focused ? 2.5 : 2} />;
};
