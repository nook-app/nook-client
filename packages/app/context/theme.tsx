import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useMemo,
  useEffect,
} from "react";
import { config, TamaguiProvider, Theme, ThemeName } from "@nook/app-ui";
import { NextThemeProvider, useRootTheme } from "@tamagui/next-theme";
import { useServerInsertedHTML } from "next/navigation";
import { useAuth } from "./auth";
import { updateSession } from "../utils/local-storage";
import { updateTheme } from "../api/settings";
import { updateServerSession } from "../server/session";

type ThemeContextType = {
  rootTheme: "dark" | "light";
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type SheetProviderProps = {
  defaultTheme?: ThemeName;
  children: ReactNode;
};

export const ThemeProvider = ({
  children,
  defaultTheme,
}: SheetProviderProps) => {
  const [rootTheme, setRootTheme] = useRootTheme();
  const [theme, setTheme] = useState<ThemeName>(defaultTheme || "mauve");
  const { session } = useAuth();

  useEffect(() => {
    if (session?.theme) {
      setTheme(session.theme as ThemeName);
    }
  }, [session]);

  useServerInsertedHTML(() => {
    return (
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
        dangerouslySetInnerHTML={{
          __html: config.getCSS(),
        }}
      />
    );
  });

  const contents = useMemo(() => {
    return <>{children}</>;
  }, [children]);

  const handleSetTheme = async (t: ThemeName) => {
    setTheme(t);
    if (session) {
      await updateTheme(t);
      const updatedSession = { ...session, theme: t };
      await updateServerSession(updatedSession);
      await updateSession(updatedSession);
    }
  };

  return (
    <NextThemeProvider onChangeTheme={setRootTheme as (name: string) => void}>
      <TamaguiProvider
        config={config}
        disableInjectCSS
        themeClassNameOnRoot
        defaultTheme={rootTheme}
      >
        <ThemeContext.Provider
          value={{
            rootTheme,
            theme,
            setTheme: handleSetTheme,
          }}
        >
          <Theme name={theme}>{contents}</Theme>
        </ThemeContext.Provider>
      </TamaguiProvider>
    </NextThemeProvider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
