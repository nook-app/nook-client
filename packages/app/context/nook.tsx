import { createContext, useContext, ReactNode } from "react";
import {
  Bell,
  Calendar,
  Home,
  Image,
  Info,
  MessagesSquare,
  MousePointerSquare,
  Search,
  Settings,
  User,
  Users,
  Users2,
  Wallet2,
} from "@tamagui/lucide-icons";
import { NotificationsCount } from "../features/notifications/notifications-count";

export type NookNavigationItem = {
  label: string;
  Icon: typeof Home;
  href: string | ((userId: string) => string);
  right?: ReactNode;
  isExternal?: boolean;
  auth?: boolean;
};

type NookConfig = {
  name: string;
  banner?: string;
  navigation: NookNavigationItem[];
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
        Icon: MessagesSquare,
        href: "/channels/farcon",
      },
    ],
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
      label: "Transactions",
      Icon: Users2,
      href: "/transactions",
      auth: true,
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
    {
      label: "Notifications",
      Icon: Bell,
      href: "/notifications",
      right: <NotificationsCount />,
      auth: true,
    },
    {
      label: "Profile",
      Icon: User,
      href: (userId) => `/users/${userId}`,
      auth: true,
    },
    {
      label: "Settings",
      Icon: Settings,
      href: "/settings",
      auth: true,
    },
  ],
};
