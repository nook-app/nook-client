import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as RNThemeProvider,
} from "@react-navigation/native";
import { TamaguiConfig, TamaguiProvider } from "tamagui";
import { config } from "@nook/app-ui/src/tamagui.config";
import { useColorScheme } from "react-native";
import { updateTheme } from "../api/settings";
import { Theme, ThemeName } from "@nook/app-ui";
import { getSession, updateSession } from "../utils/local-storage";

type ThemeContextType = {
  rootTheme: "dark" | "light";
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type SheetProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = ({ children }: SheetProviderProps) => {
  const [theme, setTheme] = useState<ThemeName>("mauve");
  const colorScheme = useColorScheme();

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session?.theme) {
        setTheme(session.theme as ThemeName);
      }
    })();
  }, []);

  const handleSetTheme = async (t: ThemeName) => {
    setTheme(t);
    const session = await getSession();
    if (session) {
      await updateTheme(t);
      await updateSession({ ...session, theme: t });
    }
  };

  return (
    <TamaguiProvider config={config} defaultTheme={colorScheme || "dark"}>
      <RNThemeProvider
        value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      >
        <ThemeContext.Provider
          value={{
            rootTheme: colorScheme || "dark",
            theme: theme as keyof TamaguiConfig["themes"],
            setTheme: handleSetTheme,
          }}
        >
          {children}
        </ThemeContext.Provider>
      </RNThemeProvider>
    </TamaguiProvider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
