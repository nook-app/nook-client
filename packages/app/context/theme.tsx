import { createContext, useContext, ReactNode, useState, useMemo } from "react";
import {
  config,
  TamaguiProvider as TamaguiProviderOG,
  Theme,
  ThemeName,
} from "@nook/ui";
import {
  ColorScheme,
  NextThemeProvider,
  useRootTheme,
} from "@tamagui/next-theme";
import { useServerInsertedHTML } from "next/navigation";
import { updateTheme } from "../server/user";
import { useAuth } from "./auth";
import { updateSession } from "../utils/local-storage";

type ThemeContextType = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  colorScheme: "light" | "dark";
  colorSchemeOverride: string | null;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type SheetProviderProps = {
  defaultTheme?: ThemeName;
  children: ReactNode;
};

export const ThemeProvider = ({
  defaultTheme,
  children,
}: SheetProviderProps) => {
  const [theme, setTheme] = useState<ThemeName>(defaultTheme || "pink");
  const [colorScheme, setColorScheme] = useRootTheme();
  const [colorSchemeOverride, setColorSchemeOverride] = useState<string | null>(
    null,
  );
  const { session } = useAuth();

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
    await updateTheme(t);
    if (session) {
      updateSession({ ...session, theme: t });
    }
  };

  return (
    <NextThemeProvider onChangeTheme={(t) => setColorScheme(t as ColorScheme)}>
      <TamaguiProviderOG
        config={config}
        disableInjectCSS
        themeClassNameOnRoot
        defaultTheme={colorScheme}
      >
        <ThemeContext.Provider
          value={{
            theme,
            setTheme: handleSetTheme,
            colorScheme,
            colorSchemeOverride,
          }}
        >
          <Theme name={theme}>{contents}</Theme>
        </ThemeContext.Provider>
      </TamaguiProviderOG>
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
