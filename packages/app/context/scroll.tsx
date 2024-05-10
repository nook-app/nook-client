import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { usePathname } from "expo-router";

type ScrollContextType = {
  isScrolling: boolean;
  setIsScrolling: (scrolling: boolean) => void;
};

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

type SheetProviderProps = {
  children: ReactNode;
};

export const ScrollProvider = ({ children }: SheetProviderProps) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) setIsScrolling(false);
  }, [pathname]);

  return (
    <ScrollContext.Provider
      value={{
        isScrolling,
        setIsScrolling,
      }}
    >
      {children}
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
