import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as RNThemeProvider,
} from "@react-navigation/native";
import { TamaguiConfig, TamaguiProvider } from "tamagui";
import { config } from "@/tamagui.config";
import { useColorScheme } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { setUserData, updateColorSchemeOverride } from "@/utils/api";
import { useAuth } from "./auth";
import { updateSession } from "@/utils/session";

type ThemeContextType = {
  theme: keyof TamaguiConfig["themes"];
  setTheme: (theme: string) => void;
  colorScheme: "light" | "dark";
  colorSchemeOverride: string | null;
  toggleColorScheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type SheetProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = ({ children }: SheetProviderProps) => {
  const [theme, setTheme] = useState<string>("mauve");
  const colorScheme = useColorScheme();
  const [colorSchemeOverride, setColorSchemeOverride] = useState<string | null>(
    null,
  );
  const { mutate } = useMutation({ mutationFn: setUserData });
  const { session, metadata } = useAuth();

  useEffect(() => {
    if (session?.theme) {
      setTheme(session.theme);
    }
  }, [session?.theme]);

  const handleSetTheme = useCallback(
    async (newTheme: string) => {
      setTheme(newTheme);
      mutate({ theme: newTheme });
      if (session) {
        updateSession({ ...session, theme: newTheme });
      }
    },
    [session?.fid],
  );

  useEffect(() => {
    setColorSchemeOverride(metadata?.colorSchemeOverride || null);
  }, [metadata?.colorSchemeOverride]);

  const toggleColorScheme = useCallback(async () => {
    const next =
      colorSchemeOverride === "light"
        ? "dark"
        : colorSchemeOverride === "dark"
          ? null
          : "light";
    setColorSchemeOverride(next);
    await updateColorSchemeOverride(next);
  }, [colorSchemeOverride]);

  const colorSchemeValue = (colorSchemeOverride || colorScheme || "dark") as
    | "light"
    | "dark";

  useEffect(() => {
    if (colorSchemeValue === "dark" && theme === "light") {
      setTheme("dark");
    } else if (colorSchemeValue === "light" && theme === "dark") {
      setTheme("light");
    }
  }, [colorSchemeValue]);

  return (
    <TamaguiProvider config={config} defaultTheme={colorSchemeValue as any}>
      <RNThemeProvider
        value={colorSchemeValue === "dark" ? DarkTheme : DefaultTheme}
      >
        <ThemeContext.Provider
          value={{
            theme: theme as keyof TamaguiConfig["themes"],
            setTheme: handleSetTheme,
            colorSchemeOverride,
            colorScheme: colorSchemeValue,
            toggleColorScheme,
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
