import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
} from "react";

type MenuContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setIsOpen: (isOpen: boolean) => void;
};

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <MenuContext.Provider value={{ isOpen, open, close, setIsOpen }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
};
