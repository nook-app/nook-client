import { createContext, useContext, ReactNode } from "react";
import {
  Bell,
  Calendar,
  Home,
  Image,
  Info,
  MessageSquareQuote,
  MousePointerSquare,
  Search,
  Settings,
  User,
  Users,
} from "@tamagui/lucide-icons";
import { NotificationsCount } from "../features/notifications/notifications-count";

export type NookNavigationItem = {
  label: string;
  Icon: typeof Home;
  href: string | ((userId: string) => string);
  right?: ReactNode;
  isExternal?: boolean;
};

type NookConfig = {
  name: string;
  banner?: string;
  navigation: NookNavigationItem[];
  authNavigation: NookNavigationItem[];
};

type NookContextType = NookConfig & {
  nook: string;
};

const NookContext = createContext<NookContextType | undefined>(undefined);

type NookProviderProps = {
  nook?: string;
  children: ReactNode;
};

export const NookProvider = ({ children, nook }: NookProviderProps) => {
  const resolvedNook = nook || "nook";

  const config = NOOK_CONFIG[resolvedNook] || DEFAULT_CONFIG;
  return (
    <NookContext.Provider
      value={{
        nook: resolvedNook,
        ...config,
      }}
    >
      {children}
    </NookContext.Provider>
  );
};

export const useNook = () => {
  const context = useContext(NookContext);
  if (context === undefined) {
    throw new Error("useNook must be used within a NookProvider");
  }
  return context;
};

const NOOK_CONFIG: { [key: string]: NookConfig } = {
  farcon: {
    name: "farcon",
    banner: "https://i.imgur.com/yii9EpK.png",
    navigation: [
      {
        label: "Home",
        Icon: Home,
        href: "/",
      },
      {
        label: "Information",
        Icon: Info,
        href: "https://farcon.xyz/",
        isExternal: true,
      },
      {
        label: "Events",
        Icon: Calendar,
        href: "https://events.xyz/c/farcon",
        isExternal: true,
      },
      {
        label: "Attendees",
        Icon: Users,
        href: "/attendees",
      },
      {
        label: "Channel",
        Icon: MessageSquareQuote,
        href: "/channels/farcon",
      },
    ],
    authNavigation: [],
  },
};

const DEFAULT_CONFIG: NookConfig = {
  name: "nook",
  navigation: [
    {
      label: "Home",
      Icon: Home,
      href: "/",
    },
    {
      label: "Media",
      Icon: Image,
      href: "/media",
    },
    {
      label: "Frames",
      Icon: MousePointerSquare,
      href: "/frames",
    },
    {
      label: "Explore",
      Icon: Search,
      href: "/explore",
    },
  ],
  authNavigation: [
    {
      label: "Notifications",
      Icon: Bell,
      href: "/notifications",
      right: <NotificationsCount />,
    },
    {
      label: "Profile",
      Icon: User,
      href: (userId) => `/users/${userId}`,
    },
    {
      label: "Settings",
      Icon: Settings,
      href: "/settings",
    },
  ],
};
