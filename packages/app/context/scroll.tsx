import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useMemo,
} from "react";
import { usePathname } from "expo-router";

type ScrollContextType = {
  isScrolling: boolean;
  setIsScrolling: (scrolling: boolean) => void;
  activeVideo: string | null;
  setActiveVideo: (uri: string | null) => void;
};

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

type SheetProviderProps = {
  children: ReactNode;
};

export const ScrollProvider = ({ children }: SheetProviderProps) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) setIsScrolling(false);
  }, [pathname]);

  const memoChildren = useMemo(() => children, [children]);

  const value = useMemo(
    () => ({
      isScrolling,
      setIsScrolling,
      activeVideo,
      setActiveVideo,
    }),
    [isScrolling, activeVideo],
  );

  return (
    <ScrollContext.Provider value={value}>
      {memoChildren}
    </ScrollContext.Provider>
  );
};

export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (context === undefined) {
    throw new Error("useScroll must be used within a ScrollProvider");
  }
  return context;
};
